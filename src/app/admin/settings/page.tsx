'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { CogIcon, GlobeAltIcon, ClockIcon } from '@heroicons/react/24/outline'

interface SiteSettings {
  id?: string
  site_name: string
  site_description: string
  site_url: string
  admin_email: string
  google_analytics_id: string
  google_adsense_client_id: string
  posts_per_page: number
  auto_approve_comments: boolean
  enable_comments: boolean
  enable_rss: boolean
}

interface CollectionSettings {
  id?: string
  target_boards: string[]
  min_post_count: number
  collection_interval: number
  auto_collection_enabled: boolean
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('site')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    site_name: '5ch.sc まとめブログ',
    site_description: '5ch.scの人気スレッドをまとめたブログサイト',
    site_url: 'http://localhost:3000',
    admin_email: '',
    google_analytics_id: '',
    google_adsense_client_id: '',
    posts_per_page: 10,
    auto_approve_comments: false,
    enable_comments: true,
    enable_rss: true,
  })

  const [collectionSettings, setCollectionSettings] = useState<CollectionSettings>({
    target_boards: ['livegalileo', 'news4vip'],
    min_post_count: 100,
    collection_interval: 24,
    auto_collection_enabled: true,
  })

  // 対象板の文字列表現（編集用）
  const [targetBoardsText, setTargetBoardsText] = useState('livegalileo, news4vip')

  // 設定を読み込み
  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      
      // サイト設定取得
      const siteResponse = await fetch('/api/settings/site')
      if (siteResponse.ok) {
        const siteData = await siteResponse.json()
        setSiteSettings(prev => ({ ...prev, ...siteData }))
      }

      // 収集設定取得
      const collectionResponse = await fetch('/api/settings/collection')
      if (collectionResponse.ok) {
        const collectionData = await collectionResponse.json()
        setCollectionSettings(prev => ({ ...prev, ...collectionData }))
        // 対象板のテキスト表現も更新
        if (collectionData.target_boards) {
          setTargetBoardsText(collectionData.target_boards.join(', '))
        }
      }
    } catch (error) {
      console.error('Settings fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // サイト設定保存
  const saveSiteSettings = async () => {
    try {
      setIsSaving(true)
      const response = await fetch('/api/settings/site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings),
      })

      if (response.ok) {
        toast.success('サイト設定を保存しました')
      } else {
        toast.error('設定の保存に失敗しました')
      }
    } catch (error) {
      toast.error('設定の保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  // 収集設定保存
  const saveCollectionSettings = async () => {
    try {
      setIsSaving(true)
      
      // テキストから配列に変換
      const parsedTargetBoards = targetBoardsText
        .split(',')
        .map(s => s.trim())
        .filter(s => s)
      
      const settingsToSave = {
        ...collectionSettings,
        target_boards: parsedTargetBoards
      }
      
      const response = await fetch('/api/settings/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsToSave),
      })

      if (response.ok) {
        toast.success('収集設定を保存しました')
        // 成功時に状態も更新
        setCollectionSettings(settingsToSave)
      } else {
        toast.error('設定の保存に失敗しました')
      }
    } catch (error) {
      toast.error('設定の保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const tabs = [
    { id: 'site', name: 'サイト設定', icon: GlobeAltIcon },
    { id: 'collection', name: 'スレッド収集', icon: ClockIcon },
  ]

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="mt-2 text-gray-600">
          サイトの基本設定とスレッド収集の設定を管理します
        </p>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">設定を読み込み中...</p>
        </div>
      ) : (
        <>
          {/* サイト設定タブ */}
          {activeTab === 'site' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-6">
                <CogIcon className="h-6 w-6 text-gray-400 mr-3" />
                <h2 className="text-lg font-semibold text-gray-900">サイト基本設定</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    サイト名
                  </label>
                  <input
                    type="text"
                    value={siteSettings.site_name}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, site_name: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    サイトURL
                  </label>
                  <input
                    type="url"
                    value={siteSettings.site_url}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, site_url: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    サイト説明
                  </label>
                  <textarea
                    value={siteSettings.site_description}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, site_description: e.target.value }))}
                    rows={3}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    管理者メールアドレス
                  </label>
                  <input
                    type="email"
                    value={siteSettings.admin_email}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, admin_email: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ページあたりの記事数
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={siteSettings.posts_per_page}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, posts_per_page: parseInt(e.target.value) }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Analytics ID
                  </label>
                  <input
                    type="text"
                    placeholder="G-XXXXXXXXXX"
                    value={siteSettings.google_analytics_id}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, google_analytics_id: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google AdSense クライアントID
                  </label>
                  <input
                    type="text"
                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                    value={siteSettings.google_adsense_client_id}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, google_adsense_client_id: e.target.value }))}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="mt-8 border-t pt-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">コメント設定</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={siteSettings.enable_comments}
                      onChange={(e) => setSiteSettings(prev => ({ ...prev, enable_comments: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">コメント機能を有効にする</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={siteSettings.auto_approve_comments}
                      onChange={(e) => setSiteSettings(prev => ({ ...prev, auto_approve_comments: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">コメントを自動承認する</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={siteSettings.enable_rss}
                      onChange={(e) => setSiteSettings(prev => ({ ...prev, enable_rss: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">RSSフィードを有効にする</span>
                  </label>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={saveSiteSettings}
                  disabled={isSaving}
                  className="btn-primary"
                >
                  {isSaving ? '保存中...' : 'サイト設定を保存'}
                </button>
              </div>
            </div>
          )}

          {/* スレッド収集設定タブ */}
          {activeTab === 'collection' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-6">
                <ClockIcon className="h-6 w-6 text-gray-400 mr-3" />
                <h2 className="text-lg font-semibold text-gray-900">スレッド収集設定</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    対象板（カンマ区切り）
                  </label>
                  <input
                    type="text"
                    value={targetBoardsText}
                    onChange={(e) => setTargetBoardsText(e.target.value)}
                    placeholder="livegalileo, news4vip"
                    className="input-field"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    収集対象の5ch板名を入力してください
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最小レス数
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={collectionSettings.min_post_count}
                    onChange={(e) => setCollectionSettings(prev => ({ ...prev, min_post_count: parseInt(e.target.value) }))}
                    className="input-field"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    この数以上のレスがあるスレッドのみ収集します
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    収集間隔（時間）
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={collectionSettings.collection_interval}
                    onChange={(e) => setCollectionSettings(prev => ({ ...prev, collection_interval: parseInt(e.target.value) }))}
                    className="input-field"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    自動収集の実行間隔を時間で指定します
                  </p>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={collectionSettings.auto_collection_enabled}
                      onChange={(e) => setCollectionSettings(prev => ({ ...prev, auto_collection_enabled: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">自動収集を有効にする</span>
                  </label>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={saveCollectionSettings}
                  disabled={isSaving}
                  className="btn-primary"
                >
                  {isSaving ? '保存中...' : '収集設定を保存'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  )
}