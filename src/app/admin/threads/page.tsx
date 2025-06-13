'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { 
  CollectionIcon, 
  EyeIcon, 
  CalendarIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Thread } from '@/types'

export default function ThreadsPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCollecting, setIsCollecting] = useState(false)

  // スレッド一覧を取得
  const fetchThreads = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/threads/collect')
      const data = await response.json()
      
      if (response.ok) {
        setThreads(data.threads || [])
      } else {
        toast.error(data.error || 'スレッド取得に失敗しました')
      }
    } catch (error) {
      toast.error('スレッド取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // スレッド収集を実行
  const collectThreads = async () => {
    try {
      setIsCollecting(true)
      toast.loading('スレッドを収集中...')
      
      const response = await fetch('/api/threads/collect', {
        method: 'POST',
      })
      const data = await response.json()
      
      toast.dismiss()
      
      if (response.ok) {
        toast.success(data.message)
        await fetchThreads() // 一覧を再取得
      } else {
        toast.error(data.error || 'スレッド収集に失敗しました')
      }
    } catch (error) {
      toast.dismiss()
      toast.error('スレッド収集に失敗しました')
    } finally {
      setIsCollecting(false)
    }
  }

  useEffect(() => {
    fetchThreads()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getBoardDisplayName = (board: string) => {
    const boardNames: { [key: string]: string } = {
      'livegalileo': 'なんでも実況G',
      'news4vip': 'ニュー速VIP',
    }
    return boardNames[board] || board
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">スレッド収集</h1>
            <p className="mt-2 text-gray-600">
              5ch.scから人気スレッドを収集・管理します
            </p>
          </div>
          <button
            onClick={collectThreads}
            disabled={isCollecting}
            className="btn-primary flex items-center"
          >
            <CollectionIcon className="h-5 w-5 mr-2" />
            {isCollecting ? '収集中...' : 'スレッド収集'}
          </button>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ChatBubbleLeftIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">総スレッド数</h3>
              <p className="text-2xl font-bold text-blue-600">{threads.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">最終収集</h3>
              <p className="text-sm text-gray-600">
                {threads.length > 0 ? formatDate(threads[0].last_collected_at || threads[0].created_at) : '未実行'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <EyeIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">平均レス数</h3>
              <p className="text-2xl font-bold text-purple-600">
                {threads.length > 0 
                  ? Math.round(threads.reduce((sum, t) => sum + t.post_count, 0) / threads.length)
                  : 0
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* スレッド一覧 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">収集済みスレッド</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : threads.length === 0 ? (
          <div className="p-8 text-center">
            <CollectionIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">まだスレッドが収集されていません</p>
            <button
              onClick={collectThreads}
              className="mt-4 btn-primary"
            >
              スレッドを収集する
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {threads.map((thread) => (
              <div key={thread.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getBoardDisplayName(thread.board)}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {thread.post_count}レス
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {thread.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span>収集日時: {formatDate(thread.last_collected_at || thread.created_at)}</span>
                      <span>ステータス: {thread.status === 'active' ? 'アクティブ' : 'アーカイブ'}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/threads/${thread.id}`}
                      className="btn-secondary"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      詳細
                    </Link>
                    <a
                      href={thread.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      元スレ
                    </a>
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