'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { 
  DocumentTextIcon, 
  RectangleStackIcon, 
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
    // 実際のデータを取得
    const fetchStats = async () => {
      try {
        // 記事統計を取得
        const articlesResponse = await fetch('/api/articles')
        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json()
          const articles = articlesData.articles || []
          
          setStats(prev => ({
            ...prev,
            totalArticles: articles.length,
            publishedArticles: articles.filter((a: any) => a.status === 'published').length,
          }))
        }

        // スレッド統計を取得
        const threadsResponse = await fetch('/api/threads/collect')
        if (threadsResponse.ok) {
          const threadsData = await threadsResponse.json()
          const threads = threadsData.collected_threads || []
          
          setStats(prev => ({
            ...prev,
            totalThreads: threads.length,
          }))
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      }
    }

    fetchStats()
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
      icon: RectangleStackIcon,
      color: 'bg-purple-500',
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
              <RectangleStackIcon className="h-5 w-5 text-gray-400 mr-3" />
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
            システム状態
          </h2>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              <span className="text-gray-600">システムが正常に動作しています</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}