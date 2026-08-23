// Vercel Serverless Function
// 日記エントリの和訳・採点・添削を Claude Sonnet 5 で行う。
// タグ分類（api/classify.js）はHaiku 4.5のままにして、こちらだけ精度重視でSonnetを使う。
// ANTHROPIC_API_KEY は Vercel の環境変数から読み込み、クライアントには一切渡さない。

const MAX_TEXT_LENGTH = 1000;

const SYSTEM_PROMPT = `You are an English writing coach for a Japanese English-learner. Respond in JSON only, no code fences, no extra text: {"translation": "...", "score": 0-10 (number), "feedback": "...", "corrected": "..."}. "translation" is a natural Japanese translation of the entry, written in Japanese. "score" is out of 10. "feedback" is a brief Japanese explanation of grammar/naturalness issues found, written in Japanese. "corrected" is a natural, corrected English version of the entry.`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body || {};

  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required' });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({ error: `text must be ${MAX_TEXT_LENGTH} characters or fewer` });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: text }]
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Anthropic API error:', response.status, errBody);
      return res.status(502).json({ error: 'Review failed' });
    }

    const data = await response.json();
    const content = data?.content?.[0]?.text || '';

    let result = null;
    try {
      const objMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = objMatch ? objMatch[0] : content;
      const parsed = JSON.parse(jsonStr);
      if (
        typeof parsed.translation === 'string' &&
        typeof parsed.feedback === 'string' &&
        typeof parsed.corrected === 'string'
      ) {
        result = {
          translation: parsed.translation,
          score: typeof parsed.score === 'number' ? parsed.score : null,
          feedback: parsed.feedback,
          corrected: parsed.corrected
        };
      }
    } catch (parseErr) {
      console.error('Failed to parse Claude response as JSON:', content);
    }

    if (!result) {
      return res.status(502).json({ error: 'Review failed' });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('review handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
