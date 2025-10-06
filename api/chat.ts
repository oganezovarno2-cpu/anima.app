// api/chat.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { messages = [], lang = 'ru', profile = {} } = body || {};

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  const system = [
    `You are Anima — a warm, culturally-aware AI companion.`,
    `Language: ${lang}. Be concise, supportive, natural; short paragraphs.`,
    `User profile: ${JSON.stringify(profile)}.`,
    `Speak like a real person, adapt to user's style and culture.`
  ].join(' ');

  const payload = {
    model: 'gpt-4o-mini',  // можно заменить на 'gpt-4o'
    stream: true,
    messages: [
      { role: 'system', content: system },
      ...messages.slice(-12).map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text,
      })),
    ],
  };

  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text();
      return res.status(500).end(text);
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith('data:')) continue;

        const data = line.replace(/^data:\s*/, '');
        if (data === '[DONE]') {
          res.end();
          return;
        }
        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content ?? '';
          if (delta) res.write(delta);
        } catch {
          // пропускаем шум
        }
      }
    }

    res.end();
  } catch (err: any) {
    res.status(500).end(err?.message || 'Upstream error');
  }
}
