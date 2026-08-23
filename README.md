# English Diary App 📚

自然な英語表現を身につけるための継続日記アプリです。

## 機能

- ✍️ **日記投稿** - 毎日の英語を記録
- 🤖 **AI タグ分類** - Claude API が自動で表現タイプを分類
- 📅 **カレンダービュー** - 投稿日を視覚化
- 🔥 **ストリーク表示** - 継続日数をモチベーション化
- 📊 **統計情報** - 語数、表現タイプの分析
- 💾 **自動保存** - ブラウザのローカルストレージに保存

## 構成

- フロントエンド: React（`src/`）
- バックエンド: Vercel Serverless Function（`api/classify.js`）
  - Claude API を呼び出してタグ分類を行う。APIキーはサーバー側の環境変数として保持し、ブラウザには一切送信しない。

## セットアップ

### 必要な環境
- Node.js 18 以上
- [Vercel CLI](https://vercel.com/docs/cli)（ローカルで `/api` 込みの動作確認をする場合）

### インストール

```bash
npm install
```

### ローカル開発

`/api/classify` はサーバーレス関数のため、`npm start`（CRAの開発サーバーのみ）では動作しません。API込みで動作確認する場合は Vercel CLI を使ってください。

```bash
npm install -g vercel
cp .env.example .env.local   # ANTHROPIC_API_KEY を実際の値に書き換える
vercel dev
```

### デプロイ（Vercel）

1. GitHub にプッシュ
2. Vercel に GitHub リポジトリを接続
3. Vercel のプロジェクト設定 → Environment Variables で `ANTHROPIC_API_KEY` を設定（Production / Preview 両方）
4. デプロイ

## 使い方

1. **日記を書く** - 50 語程度の英語を記入
2. **投稿** - サーバー側で Claude API を呼び出し、AI がタグを自動分類
3. **進捗を確認** - カレンダーと統計で可視化

## セキュリティ設計

- **APIキーはブラウザに存在しない** - Claude API キーは Vercel の環境変数としてサーバー側にのみ保存され、フロントエンドのコードやネットワーク通信に一切含まれない。
- **サーバー側で入力検証** - `api/classify.js` は文字数上限を設け、異常に長い入力によるトークン消費・悪用を防ぐ。
- **エラーメッセージの最小化** - クライアントには一般的なエラーのみを返し、内部の詳細（APIレスポンス本文など）はサーバーログにのみ出力する。
- **日記データはローカルのみ** - 日記本文はブラウザのローカルストレージに保存され、外部サーバーには送信・保存されない（タグ分類のリクエスト時のみ一時的にサーバーへ送られる）。
- 認証機能がない個人利用アプリのため、`/api/classify` のURLを知っていれば誰でも呼び出せる。悪用によるコスト増を防ぐため、[Anthropic Console](https://console.anthropic.com/) で使用量アラート／上限を設定することを推奨。

## ライセンス

MIT
