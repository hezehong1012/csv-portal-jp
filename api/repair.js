// POST /api/repair — AI layer for the CSV repair tool (csv.format-portal.com/ai.html)
// Expects: { csv: string, instruction: string, lang: 'ja'|'en' }
// Returns: { csv: string, notes: string }
//
// Env: LLM_API_URL / LLM_API_KEY / LLM_MODEL (DeepSeek-compatible chat API).
// If no key is configured the endpoint answers 501 so the UI can fall back to
// the browser-only rule engine.

const MAX_INPUT = 60000;

const RATE_WINDOW_MS = 60000;
const RATE_MAX = 10;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.start > RATE_WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 });
    return false;
  }
  rec.count += 1;
  if (hits.size > 3000) {
    for (const [k, v] of hits) if (now - v.start > RATE_WINDOW_MS * 5) hits.delete(k);
  }
  return rec.count > RATE_MAX;
}

function clientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length) return xff.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function systemPrompt(lang) {
  const ja = lang === 'ja';
  return [
    'You are a precise CSV data-repair engine. You receive a CSV file and one instruction from the user.',
    'Apply the instruction to the CSV and return the repaired CSV.',
    '',
    'Rules:',
    '1. Output STRICT JSON only, shaped exactly like {"csv": "...", "notes": "..."} — no markdown fence, no commentary outside the JSON.',
    '2. "csv" must be the complete resulting data serialised as RFC 4180 CSV, using comma as the delimiter, CRLF line endings, and double quotes around any value containing a comma, quote or newline.',
    '3. Keep the same number of rows unless the instruction explicitly asks to filter or remove rows.',
    '4. Never invent data that the instruction did not ask for. If a value cannot be derived, leave it empty.',
    '5. Preserve the original column order unless the instruction asks to add, remove or reorder columns.',
    '6. "notes" is one or two short sentences describing what you changed. Write the notes in ' + (ja ? 'Japanese' : 'English') + '.',
    '7. If the instruction is impossible or unsafe to apply, return the input CSV unchanged and explain why in "notes".',
    '',
    'The user may write the instruction in Japanese or English; understand both.'
  ].join('\n');
}

function extractJson(raw) {
  let s = String(raw || '').trim();
  s = s.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const a = s.indexOf('{');
  const b = s.lastIndexOf('}');
  if (a >= 0 && b > a) s = s.slice(a, b + 1);
  return JSON.parse(s);
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, configured: !!process.env.LLM_API_KEY });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.LLM_API_KEY) {
    return res.status(501).json({ error: 'AI_UNAVAILABLE' });
  }
  if (rateLimited(clientIp(req))) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
  }

  const body = req.body || {};
  const csv = typeof body.csv === 'string' ? body.csv : '';
  const instruction = typeof body.instruction === 'string' ? body.instruction.trim() : '';
  const lang = body.lang === 'en' ? 'en' : 'ja';

  if (!csv.trim()) return res.status(400).json({ error: 'csv is required' });
  if (!instruction) return res.status(400).json({ error: 'instruction is required' });
  if (csv.length > MAX_INPUT) {
    return res.status(413).json({ error: 'CSV is too large for the AI mode (limit ' + MAX_INPUT + ' characters).' });
  }

  const userPrompt = '<instruction>\n' + instruction + '\n</instruction>\n\n<csv>\n' + csv + '\n</csv>';

  const apiUrl = process.env.LLM_API_URL || 'https://api.deepseek.com/v1/chat/completions';
  const model = process.env.LLM_MODEL || 'deepseek-chat';

  try {
    const r = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.LLM_API_KEY
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt(lang) },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      })
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      return res.status(502).json({ error: 'LLM_HTTP_' + r.status, detail: detail.slice(0, 300) });
    }
    const data = await r.json();
    const raw = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!raw) return res.status(502).json({ error: 'LLM_EMPTY' });

    const parsed = extractJson(raw);
    if (typeof parsed.csv !== 'string' || !parsed.csv.trim()) {
      return res.status(502).json({ error: 'LLM_BAD_SHAPE' });
    }
    return res.status(200).json({ csv: parsed.csv, notes: parsed.notes || '' });
  } catch (e) {
    return res.status(500).json({ error: 'REPAIR_FAILED', detail: String(e && e.message || e).slice(0, 200) });
  }
}
