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
        system: 'あなたはJSONのみを出力するAPIです。説明文やコードブロック記法(```)は一切付けず、{"tags": [...]}という形式のJSONだけを返してください。',
        messages: [
          {
            role: 'user',
            content: `以下の英語日記を読んで、内容や状況を最もよく表す単語を英語で最大3つ選び、タグとして返してください。

条件:
- 各タグは「#」で始める英語の単数形名詞、小文字（例: #travel, #work, #shopping, #friends, #weather, #food, #study, #family, #exercise など）
- 固定のカテゴリーはありません。日記の内容に最も合う言葉を自由に選んでください
- 「#english」「#diary」など、このアプリの日記すべてに当てはまる自明なタグは選ばないでください
- 似た状況の日記では同じ単語を使うようにし、表記のブレ（例: #travel と #trip）は避けてください
- JSON形式のみで返してください

日記:
${text}

レスポンス例: {"tags": ["#travel", "#friends", "#food"]}`
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
      // Claudeがコードブロックや前後に説明文を付けて返す場合に備え、
      // 最初の { ... } 部分だけを抜き出してから解析する
      const objMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = objMatch ? objMatch[0] : content;
      const parsed = JSON.parse(jsonStr);
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
