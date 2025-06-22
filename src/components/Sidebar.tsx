'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Article, Category } from '@/types'

export function Sidebar() {
  const [popularArticles, setPopularArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    // 人気記事を取得
    const fetchPopularArticles = async () => {
      try {
        const response = await fetch('/api/articles?limit=5')
        if (response.ok) {
          const data = await response.json()
          setPopularArticles(data.articles || [])
        }
      } catch (error) {
        console.error('Failed to fetch popular articles:', error)
      }
    }

    // カテゴリを取得
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }

    fetchPopularArticles()
    fetchCategories()
  }, [])

  return (
    <div className="space-y-6">
      {/* 人気記事 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">人気記事</h3>
        <div className="space-y-3">
          {popularArticles.map((article, index) => (
            <div key={article.id} className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/articles/${article.slug}`}
                  className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                >
                  {article.title}
                </Link>
                <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                  <span>{article.view_count}view</span>
                  <span>{article.comment_count}コメント</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* カテゴリ */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">カテゴリ</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="block text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 px-2 py-1 rounded"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      {/* 広告スペース */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-4">広告</h3>
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-sm text-gray-500">
            広告を表示
            <br />
            (Google AdSense等)
          </p>
        </div>
      </div>

      {/* RSSリンク */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">RSS</h3>
        <Link
          href="/rss"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3.429 2.286c8.571 0 15.429 6.857 15.429 15.429h-4.571c0-5.714-4.571-10.286-10.286-10.286v-4.571zM3.429 9.143c3.429 0 6.286 2.857 6.286 6.286h-4.571c0-1.143-0.571-1.714-1.714-1.714v-4.571zM6.857 15.429c0 1.143-0.571 2.286-1.714 2.286s-2.286-1.143-2.286-2.286 1.143-2.286 2.286-2.286 1.714 1.143 1.714 2.286z"></path>
          </svg>
          RSSフィード
        </Link>
      </div>
    </div>
  )
}