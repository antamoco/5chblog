import Link from 'next/link'
import { ArticleCard } from '@/components/ArticleCard'
import { CategoryNav } from '@/components/CategoryNav'
import { SearchBar } from '@/components/SearchBar'
import { Sidebar } from '@/components/Sidebar'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                5ch.sc まとめ
              </Link>
            </div>
            <SearchBar />
          </div>
        </div>
      </header>

      {/* ナビゲーション */}
      <CategoryNav />

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 記事一覧 */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">最新記事</h1>
              
              {/* サンプル記事 */}
              <ArticleCard
                title="【悲報】今日も仕事が終わらない件について"
                excerpt="働き方改革とは何だったのか..."
                category="雑談"
                publishedAt="2024-01-15"
                slug="sample-article-1"
                commentCount={42}
              />
              
              <ArticleCard
                title="【朗報】新しいゲームが面白すぎる"
                excerpt="久々に当たりを引いたかもしれない"
                category="ゲーム"
                publishedAt="2024-01-14"
                slug="sample-article-2"
                commentCount={128}
              />
              
              <div className="text-center py-8">
                <p className="text-gray-500">
                  まだ記事がありません。管理画面から記事を作成してください。
                </p>
                <Link 
                  href="/admin" 
                  className="mt-4 inline-block btn-primary"
                >
                  管理画面へ
                </Link>
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 5ch.sc まとめブログ. All rights reserved.</p>
            <div className="mt-4 space-x-4">
              <Link href="/rss" className="hover:text-gray-700">RSS</Link>
              <Link href="/contact" className="hover:text-gray-700">お問い合わせ</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}