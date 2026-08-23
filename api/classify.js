// Vercel Serverless Function
// Claude API を呼び出して日記エントリにタグを付与する。
// ANTHROPIC_API_KEY は Vercel の環境変数（ダッシュボード側で設定）から読み込み、
// クライアント（ブラウザ）には一切渡さない。

const MAX_TEXT_LENGTH = 1000; // 50語程度の日記を想定。異常に長い入力によるトークン消費・悪用を防ぐ

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
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: `この英語の日記エントリを分析して、以下のカテゴリーから3つまでタグを選んでください。JSONフォーマットで返してください。タグは1語ずつです。

カテゴリー:
- #時制 (tense): 時制の使い方
- #感情 (emotion): 感情表現
- #日常 (daily): 日常会話
- #描写 (description): 詳細な描写
- #疑問 (question): 疑問文
- #仮定 (conditional): 仮定法

日記:
${text}

レスポンス例: {"tags": ["#時制", "#感情", "#日常"]}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Anthropic API error:', response.status, errBody);
      return res.status(502).json({ error: 'Tag classification failed' });
    }

    const data = await response.json();
    const content = data?.content?.[0]?.text || '';

    let tags = [];
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.tags)) {
        tags = parsed.tags.filter((t) => typeof t === 'string').slice(0, 3);
      }
    } catch (parseErr) {
      console.error('Failed to parse Claude response as JSON:', content);
    }

    return res.status(200).json({ tags });
  } catch (err) {
    console.error('classify handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
