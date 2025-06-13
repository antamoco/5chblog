'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Article } from '@/types'
import { CalendarIcon, EyeIcon } from '@heroicons/react/24/outline'

interface RelatedArticlesProps {
  currentArticleId: string
  categoryId?: string
}

export function RelatedArticles({ currentArticleId, categoryId }: RelatedArticlesProps) {
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 関連記事を取得
  const fetchRelatedArticles = async () => {
    try {
      setIsLoading(true)
      
      // TODO: APIから関連記事取得
      // 仮のデータ
      setRelatedArticles([
        {
          id: '2',
          title: '【朗報】新しいゲームが面白すぎる件について',
          slug: 'sample-article-2',
          content: '',
          excerpt: '久々に当たりを引いたかもしれない',
          category_id: categoryId || '1',
          status: 'published',
          created_at: '2024-01-14',
          updated_at: '2024-01-14',
          published_at: '2024-01-14',
          view_count: 256,
          comment_count: 18,
        },
        {
          id: '3',
          title: '【速報】今日のニュースまとめ',
          slug: 'sample-article-3',
          content: '',
          excerpt: '今日起きた出来事をまとめました',
          category_id: categoryId || '1',
          status: 'published',
          created_at: '2024-01-13',
          updated_at: '2024-01-13',
          published_at: '2024-01-13',
          view_count: 189,
          comment_count: 7,
        },
        {
          id: '4',
          title: '【議論】最近のアニメについて語ろう',
          slug: 'sample-article-4',
          content: '',
          excerpt: '今期のアニメで何が一番面白い？',
          category_id: categoryId || '1',
          status: 'published',
          created_at: '2024-01-12',
          updated_at: '2024-01-12',
          published_at: '2024-01-12',
          view_count: 334,
          comment_count: 45,
        },
      ])
    } catch (error) {
      console.error('Failed to fetch related articles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    })
  }

  useEffect(() => {
    fetchRelatedArticles()
  }, [currentArticleId, categoryId])

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">関連記事</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-32 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (relatedArticles.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">関連記事</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedArticles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="group block"
          >
            <article className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              {/* 仮の画像プレースホルダー */}
              <div className="aspect-video bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white text-xs font-medium">NO IMAGE</span>
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {formatDate(article.published_at || article.created_at)}
                  </div>
                  <div className="flex items-center">
                    <EyeIcon className="h-3 w-3 mr-1" />
                    {article.view_count}
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          もっと記事を見る →
        </Link>
      </div>
    </div>
  )
}