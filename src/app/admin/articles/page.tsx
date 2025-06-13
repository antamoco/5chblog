'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { 
  DocumentTextIcon, 
  PlusIcon, 
  EyeIcon, 
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { Article } from '@/types'

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState({
    status: 'all',
    search: ''
  })

  // 記事一覧を取得
  const fetchArticles = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      
      if (filter.status !== 'all') {
        params.append('status', filter.status)
      }
      if (filter.search) {
        params.append('search', filter.search)
      }

      const response = await fetch(`/api/articles?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setArticles(data.articles || [])
      } else {
        toast.error(data.error || '記事取得に失敗しました')
      }
    } catch (error) {
      toast.error('記事取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [filter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { text: '下書き', color: 'bg-gray-100 text-gray-800' },
      published: { text: '公開中', color: 'bg-green-100 text-green-800' },
      archived: { text: 'アーカイブ', color: 'bg-yellow-100 text-yellow-800' },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">記事管理</h1>
            <p className="mt-2 text-gray-600">
              ブログ記事の作成・編集・管理を行います
            </p>
          </div>
          <Link
            href="/admin/articles/new"
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            新しい記事
          </Link>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ステータス
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              className="input-field"
            >
              <option value="all">すべて</option>
              <option value="draft">下書き</option>
              <option value="published">公開中</option>
              <option value="archived">アーカイブ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              検索
            </label>
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              placeholder="タイトルや内容で検索..."
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">総記事数</h3>
              <p className="text-2xl font-bold text-blue-600">{articles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">公開中</h3>
              <p className="text-2xl font-bold text-green-600">
                {articles.filter(a => a.status === 'published').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-gray-500" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">下書き</h3>
              <p className="text-2xl font-bold text-gray-600">
                {articles.filter(a => a.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <EyeIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">総ビュー数</h3>
              <p className="text-2xl font-bold text-purple-600">
                {articles.reduce((sum, a) => sum + a.view_count, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 記事一覧 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">記事一覧</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-8 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {filter.status !== 'all' || filter.search 
                ? '条件に一致する記事がありません' 
                : 'まだ記事がありません'
              }
            </p>
            <Link
              href="/admin/articles/new"
              className="mt-4 btn-primary inline-flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              新しい記事を作成
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {articles.map((article) => (
              <div key={article.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusBadge(article.status)}
                      <span className="text-xs text-gray-500">
                        {article.category_id}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span>作成: {formatDate(article.created_at)}</span>
                      {article.published_at && (
                        <span>公開: {formatDate(article.published_at)}</span>
                      )}
                      <span>{article.view_count}view</span>
                      <span>{article.comment_count}コメント</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {article.status === 'published' && (
                      <Link
                        href={`/articles/${article.slug}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                    )}
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        // TODO: 削除機能実装
                        toast.error('削除機能は未実装です')
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}