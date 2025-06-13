import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import { 
  CalendarIcon, 
  EyeIcon, 
  ChatBubbleLeftIcon,
  TagIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { CommentSection } from '@/components/CommentSection'
import { RelatedArticles } from '@/components/RelatedArticles'

interface ArticlePageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { data: article } = await supabaseAdmin
    .from('articles')
    .select('title, excerpt, meta_description, og_image')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!article) {
    return {
      title: '記事が見つかりません',
    }
  }

  return {
    title: article.title,
    description: article.meta_description || article.excerpt,
    openGraph: {
      title: article.title,
      description: article.meta_description || article.excerpt,
      images: article.og_image ? [article.og_image] : [],
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  // 記事データを取得
  const { data: article, error } = await supabaseAdmin
    .from('articles')
    .select(`
      *,
      categories:category_id (
        id,
        name,
        slug
      )
    `)
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (error || !article) {
    notFound()
  }

  // ビュー数を増加（非同期）
  supabaseAdmin
    .from('articles')
    .update({ view_count: article.view_count + 1 })
    .eq('id', article.id)
    .then()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatContent = (content: string) => {
    // レス形式のHTMLを適切にフォーマット
    return content
      .replace(/data-post-number="(\d+)"/g, 'data-post-number="$1"')
      .replace(/<div class="post-item"/g, '<div class="post-item mb-4 p-4 bg-gray-50 border-l-4 border-blue-500"')
      .replace(/<div class="post-meta">/g, '<div class="post-meta text-sm text-gray-600 font-medium mb-2">')
      .replace(/<div class="post-content"/g, '<div class="post-content text-gray-800">')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <Link 
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              ホームに戻る
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* 記事ヘッダー */}
          <header className="p-8 border-b border-gray-200">
            <div className="mb-4">
              <Link
                href={`/category/${article.categories?.slug}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                <TagIcon className="h-4 w-4 mr-1" />
                {article.categories?.name}
              </Link>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {formatDate(article.published_at || article.created_at)}
                </div>
                <div className="flex items-center">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  {article.view_count.toLocaleString()}
                </div>
                <div className="flex items-center">
                  <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                  {article.comment_count}
                </div>
              </div>
            </div>
          </header>

          {/* 記事本文 */}
          <div className="p-8">
            {article.excerpt && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
                <p className="text-blue-800 font-medium">{article.excerpt}</p>
              </div>
            )}

            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: formatContent(article.content) 
              }}
            />

            {/* キーワード */}
            {article.keywords && article.keywords.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-3">タグ</h3>
                <div className="flex flex-wrap gap-2">
                  {article.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* 関連記事 */}
        <div className="mt-12">
          <RelatedArticles 
            currentArticleId={article.id}
            categoryId={article.category_id}
          />
        </div>

        {/* コメントセクション */}
        <div className="mt-12">
          <CommentSection articleId={article.id} />
        </div>

        {/* ナビゲーション */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/"
            className="btn-primary inline-flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            記事一覧に戻る
          </Link>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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