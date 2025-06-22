# Cloudflare Pages デプロイガイド

## 前提条件
- GitHubアカウント
- Cloudflareアカウント
- Supabaseプロジェクト

## 1. GitHubリポジトリの準備

### リポジトリ作成
```bash
# GitHubでリポジトリを作成後
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/5chblog.git
git push -u origin main
```

## 2. Cloudflare Pages設定

### プロジェクト作成
1. [Cloudflare Dashboard](https://dash.cloudflare.com) にログイン
2. 「Pages」→「Create a project」
3. 「Connect to Git」でGitHubリポジトリを選択

### ビルド設定
```
Build command: npm run build
Build output directory: out
Root directory: (leave empty)
```

### 環境変数設定（必須）
Cloudflare Pages Dashboard → Settings → Environment variables

#### 本番環境（Production）
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=https://yourdomain.pages.dev
NEXT_PUBLIC_SITE_URL=https://yourdomain.pages.dev
NODE_ENV=production
CF_PAGES=true
```

#### プレビュー環境（Preview）
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=https://preview-branch.yourdomain.pages.dev
NEXT_PUBLIC_SITE_URL=https://preview-branch.yourdomain.pages.dev
NODE_ENV=development
CF_PAGES=true
```

#### オプション環境変数
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
```

## 3. Supabase設定更新

### 認証設定
Supabase Dashboard → Authentication → URL Configuration
```
Site URL: https://yourdomain.pages.dev
Redirect URLs: https://yourdomain.pages.dev/api/auth/callback/*
```

### CORS設定
Supabase Dashboard → Settings → API
```
Allow origins: https://yourdomain.pages.dev
```

## 4. 独自ドメイン設定（オプション）

### Cloudflare Pages
1. Pages → youproject → Custom domains
2. 「Set up a custom domain」
3. ドメイン名を入力
4. DNS設定をCloudflareに移管

### 環境変数更新
独自ドメイン使用時は以下を更新：
```
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 5. デプロイ確認

### 自動デプロイ
- `main`ブランチへのpushで本番デプロイ
- 他のブランチへのpushでプレビューデプロイ

### 手動デプロイ
Cloudflare Pages Dashboard → Deployments → 「Retry deployment」

## 6. トラブルシューティング

### よくある問題

#### 1. ビルドエラー
```bash
# ローカルでテスト
npm run build
```

#### 2. 環境変数の問題
- 大文字小文字を正確に
- スペースや改行文字に注意
- `NEXT_PUBLIC_`プレフィックスの確認

#### 3. 認証エラー
- `NEXTAUTH_URL`が正しいか確認
- Supabaseの認証設定を確認

#### 4. データベース接続エラー
- Supabaseの接続情報を確認
- サービスロールキーの権限確認

## 7. パフォーマンス最適化

### キャッシュ設定
`_headers`ファイルでキャッシュポリシーを設定済み

### 画像最適化
- Cloudflare Imagesを使用（有料プランの場合）
- または外部画像CDNを使用

## 8. セキュリティ設定

### セキュリティヘッダー
`_headers`ファイルでセキュリティヘッダーを設定済み

### 環境変数の管理
- 機密情報はCloudflare Pages環境変数に保存
- `.env`ファイルはGitにコミットしない

## 9. 監視・メンテナンス

### ログ確認
Cloudflare Pages Dashboard → Functions → Real-time logs

### 分析
Cloudflare Dashboard → Analytics

### アップデート
```bash
git add .
git commit -m "Update"
git push origin main
```

## 10. 費用について

### Cloudflare Pages無料プラン制限
- 月間500ビルド
- 20,000リクエスト/月
- 無制限の帯域幅

### 制限超過時
- Cloudflare Pages Pro: $20/月
- または他のホスティングサービスに移行

## サポート

問題が発生した場合：
1. [Cloudflare Pages ドキュメント](https://developers.cloudflare.com/pages/)
2. [Next.js静的エクスポートガイド](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
3. GitHubリポジトリのIssues