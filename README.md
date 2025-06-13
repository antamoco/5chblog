# 5ch.sc まとめブログシステム

5ch.scの人気スレッドを自動収集し、管理者が選択・編集してまとめブログとして公開できる総合システムです。

## 🚀 機能

### 📊 自動スレッド収集
- 5ch.sc から人気スレッドを自動収集
- レス数によるフィルタリング
- 定期実行スケジュール設定

### ✏️ 記事作成・編集
- 収集したスレッドからレスを選択
- ドラッグ&ドロップによる並び替え
- レスのスタイルカスタマイズ
- プレビュー機能

### 🎨 ブログ機能
- レスポンシブデザイン
- カテゴリ別記事一覧
- 検索機能
- コメント機能
- RSS配信

### 🔐 管理機能
- NextAuth.js による認証
- 記事管理
- コメント承認
- サイト設定

### 📈 SEO・分析
- メタタグ自動生成
- サイトマップ自動生成
- Google Analytics 統合
- Google AdSense 対応

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 14 + TypeScript
- **データベース**: Supabase (PostgreSQL)
- **認証**: NextAuth.js
- **スタイリング**: Tailwind CSS
- **デプロイ**: Vercel

## 🔧 セットアップ

### 1. 環境変数の設定

`.env.local` ファイルを作成し、以下の変数を設定してください：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# 管理者認証
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password

# Google Analytics（オプション）
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# Google AdSense（オプション）
NEXT_PUBLIC_ADSENSE_CLIENT_ID=your_adsense_client_id

# サイトURL
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 2. データベースのセットアップ

Supabase プロジェクトを作成し、`database/schema.sql` を実行してテーブルを作成してください。

### 3. 依存関係のインストール

```bash
npm install
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

## 📱 使用方法

### 管理者でのログイン
1. `/admin/login` にアクセス
2. 環境変数で設定したメールアドレスとパスワードでログイン

### スレッド収集
1. 管理画面 > スレッド収集
2. 「スレッド収集」ボタンをクリック
3. 収集されたスレッドから記事作成対象を選択

### 記事作成
1. スレッド詳細ページでレスを選択
2. スタイルを設定
3. 「記事を作成」ボタンで記事作成画面へ
4. タイトルや内容を編集して公開

## 🗂️ プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # 管理画面
│   ├── api/               # API ルート
│   ├── articles/          # 記事詳細ページ
│   └── category/          # カテゴリページ
├── components/            # React コンポーネント
├── lib/                   # ユーティリティ関数
├── types/                 # TypeScript 型定義
└── hooks/                 # カスタムフック
```

## 🔒 セキュリティ

- 管理機能は NextAuth.js による認証が必要
- 環境変数による管理者認証
- CSRF保護
- XSS対策

## 📋 TODO

- [ ] コメント機能の完全実装
- [ ] 画像アップロード機能
- [ ] 通知機能
- [ ] テーマ切り替え機能
- [ ] API レート制限

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストやイシューの報告をお待ちしています。

## 📞 サポート

問題や質問がある場合は、GitHub Issues をご利用ください。