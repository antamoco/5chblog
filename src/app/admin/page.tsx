'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { 
  DocumentTextIcon, 
  CollectionIcon, 
  EyeIcon, 
  ChatBubbleLeftEllipsisIcon 
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalArticles: number
  publishedArticles: number
  totalThreads: number
  totalViews: number
  totalComments: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    publishedArticles: 0,
    totalThreads: 0,
    totalViews: 0,
    totalComments: 0,
  })

  useEffect(() => {
    // TODO: APIからデータを取得
    // 仮のデータ
    setStats({
      totalArticles: 12,
      publishedArticles: 8,
      totalThreads: 45,
      totalViews: 1234,
      totalComments: 89,
    })
  }, [])

  const statCards = [
    {
      name: '総記事数',
      value: stats.totalArticles,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
    },
    {
      name: '公開記事数',
      value: stats.publishedArticles,
      icon: DocumentTextIcon,
      color: 'bg-green-500',
    },
    {
      name: '収集スレッド数',
      value: stats.totalThreads,
      icon: CollectionIcon,
      color: 'bg-purple-500',
    },
    {
      name: '総ビュー数',
      value: stats.totalViews,
      icon: EyeIcon,
      color: 'bg-yellow-500',
    },
    {
      name: '総コメント数',
      value: stats.totalComments,
      icon: ChatBubbleLeftEllipsisIcon,
      color: 'bg-pink-500',
    },
  ]

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="mt-2 text-gray-600">
          5ch.sc まとめブログの管理画面へようこそ
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${card.color}`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {card.value.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-600">{card.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* クイックアクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            クイックアクション
          </h2>
          <div className="space-y-3">
            <a
              href="/admin/threads"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CollectionIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium">スレッドを収集</span>
            </a>
            <a
              href="/admin/articles/new"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium">新しい記事を作成</span>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            最近のアクティビティ
          </h2>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              <span className="text-gray-600">システムが正常に動作しています</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
              <span className="text-gray-600">最後のスレッド収集: 2時間前</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
              <span className="text-gray-600">新しいコメント: 3件</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}