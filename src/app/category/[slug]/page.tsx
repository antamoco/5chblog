import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import { ArticleCard } from '@/components/ArticleCard'
import { CategoryNav } from '@/components/CategoryNav'
import { SearchBar } from '@/components/SearchBar'
import { Sidebar } from '@/components/Sidebar'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface CategoryPageProps {
  params: {
    slug: string
  }
  searchParams: {
    page?: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { data: category } = await supabaseAdmin
    .from('categories')
    .select('name, description')
    .eq('slug', params.slug)
    .single()

  if (!category) {
    return {
      title: 'カテゴリが見つかりません',
    }
  }

  return {
    title: `${category.name} - 5ch.sc まとめブログ`,
    description: category.description || `${category.name}に関する記事一覧`,
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const page = parseInt(searchParams.page || '1')
  const limit = 10

  // カテゴリ情報を取得
  const { data: category, error: categoryError } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (categoryError || !category) {
    notFound()
  }

  // 記事一覧を取得
  const offset = (page - 1) * limit
  const { data: articles, error: articlesError, count } = await supabaseAdmin
    .from('articles')
    .select(`
      *,
      categories:category_id (
        name,
        slug
      )
    `, { count: 'exact' })
    .eq('category_id', category.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (articlesError) {
    console.error('Articles fetch error:', articlesError)
  }

  const totalPages = Math.ceil((count || 0) / limit)

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
        {/* パンくずナビ */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ホーム
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-gray-900">{category.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 記事一覧 */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                  {category.description && (
                    <p className="mt-2 text-gray-600">{category.description}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {count}件の記事
                  </p>
                </div>
              </div>

              {/* 記事一覧 */}
              {!articles || articles.length === 0 ? (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <svg
                      className="mx-auto h-16 w-16 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      記事がありません
                    </h3>
                    <p className="mt-2 text-gray-500">
                      このカテゴリにはまだ記事が投稿されていません。
                    </p>
                    <div className="mt-6">
                      <Link href="/" className="btn-primary">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        ホームに戻る
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {articles.map((article) => (
                      <ArticleCard
                        key={article.id}
                        title={article.title}
                        excerpt={article.excerpt || ''}
                        category={category.name}
                        publishedAt={article.published_at || article.created_at}
                        slug={article.slug}
                        commentCount={article.comment_count}
                        viewCount={article.view_count}
                      />
                    ))}
                  </div>

                  {/* ページネーション */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-12">
                      <nav className="flex items-center space-x-2">
                        {page > 1 && (
                          <Link
                            href={`/category/${params.slug}?page=${page - 1}`}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            前へ
                          </Link>
                        )}
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <Link
                            key={pageNum}
                            href={`/category/${params.slug}?page=${pageNum}`}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              pageNum === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </Link>
                        ))}
                        
                        {page < totalPages && (
                          <Link
                            href={`/category/${params.slug}?page=${page + 1}`}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            次へ
                          </Link>
                        )}
                      </nav>
                    </div>
                  )}
                </>
              )}
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