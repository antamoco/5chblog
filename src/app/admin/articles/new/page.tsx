'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { 
  DocumentTextIcon, 
  EyeIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Category, Post, Thread } from '@/types'
import { processPostImages } from '@/lib/image-utils'

function NewArticleContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const threadId = searchParams.get('threadId')
  const selectedPostIds = searchParams.get('selectedPosts')?.split(',') || []

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    status: 'draft' as 'draft' | 'published',
    meta_description: '',
    keywords: [] as string[]
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [thread, setThread] = useState<Thread | null>(null)
  const [selectedPosts, setSelectedPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // カテゴリ一覧を取得
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      } else {
        toast.error('カテゴリの取得に失敗しました')
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('カテゴリの取得に失敗しました')
    }
  }

  // スレッドと選択されたレスを取得
  const fetchThreadData = async () => {
    if (!threadId || selectedPostIds.length === 0) return

    try {
      setIsLoading(true)

      // スレッド情報を取得
      const threadResponse = await fetch(`/api/threads/${threadId}`)
      if (threadResponse.ok) {
        const threadData = await threadResponse.json()
        setThread(threadData.thread)
        setFormData(prev => ({
          ...prev,
          title: threadData.thread.title
        }))
      }

      // 選択されたレスを取得
      const postsResponse = await fetch(`/api/threads/${threadId}/posts`)
      if (postsResponse.ok) {
        const postsData = await postsResponse.json()
        const posts = postsData.posts.filter((post: Post) => 
          selectedPostIds.includes(post.id)
        ).sort((a: Post, b: Post) => 
          (a.display_order || 0) - (b.display_order || 0)
        )
        
        setSelectedPosts(posts)
        
        // レスからコンテンツを生成（ハムスター速報スタイル）
        const content = posts.map((post: Post) => {
          const style = post.style_config || {}
          
          // IDと日付を抽出（contentから先に試行、次にデータベースから）
          let postId = ''
          let rawDate = ''
          
          // まずcontentから抽出を試行
          const idMatch = post.content.match(/\[ID:([^\]]+)\]/)
          const dateMatch = post.content.match(/\[(\d{4}\/\d{2}\/\d{2}[^\]]+)\]/)
          
          if (idMatch) {
            postId = idMatch[1]
          }
          if (dateMatch) {
            rawDate = dateMatch[1]
          }
          
          // contentから抽出できない場合、別のパターンで試行
          if (!postId || !rawDate) {
            // posted_atから日付を取得
            if (!rawDate && post.posted_at) {
              const date = new Date(post.posted_at)
              rawDate = date.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: '2-digit', 
                day: '2-digit',
                weekday: 'short',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              }).replace(/\//g, '/').replace(/,/g, '').replace(/\s+/g, ' ')
            }
            
            // IDがない場合はpost_numberベースで生成
            if (!postId) {
              postId = `post${post.post_number}${Math.random().toString(36).substr(2, 6)}`
            }
          }
          
          // URLをリンクに変換するヘルパー関数
          const convertUrlsToLinks = (text: string) => {
            const urlRegex = /(https?:\/\/[^\s<>\"']+)/gi
            return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
          }

          // メタ情報の除去された本文
          let cleanContent = post.content
            .replace(/\s*\[ID:[^\]]+\]\s*/g, '') // IDを削除
            .replace(/\s*\[\d{4}\/\d{2}\/\d{2}[^\]]*\]\s*/g, '') // 日付を削除
            .replace(/^>/gm, '') // 行頭の>を削除
            .replace(/^>>/gm, '') // 行頭の>>を削除
            .replace(/^&gt;/gm, '') // HTML entity行頭の>を削除
            .replace(/^&gt;&gt;/gm, '') // HTML entity行頭の>>を削除
            .replace(/\n/g, '<br>')
          
          // URLをリンクに変換
          cleanContent = convertUrlsToLinks(cleanContent)
          
          // 画像URLを画像タグに変換
          cleanContent = processPostImages(cleanContent)
          
          let postHtml = `<div class="post-item" data-post-number="${post.post_number}">`
          
          // メタ情報を一行にまとめる
          let metaInfo = `${post.post_number}：${post.author}`
          if (postId) metaInfo += ` ID:${postId}`
          if (rawDate) metaInfo += ` ${rawDate}`
          
          postHtml += `<div class="post-meta">${metaInfo}</div>`
          
          let contentStyle = ''
          if (style.color && style.color !== 'black') {
            contentStyle += `color: ${style.color}; `
          }
          if (style.fontSize === 'large') {
            contentStyle += 'font-size: 1.2em; '
          } else if (style.fontSize === 'small') {
            contentStyle += 'font-size: 0.9em; '
          }
          if (style.fontWeight === 'bold') {
            contentStyle += 'font-weight: bold; '
          }
          if (style.fontStyle === 'italic') {
            contentStyle += 'font-style: italic; '
          }

          postHtml += `<div class="post-content"${contentStyle ? ` style="${contentStyle}"` : ''}>`
          postHtml += cleanContent
          postHtml += '</div>'
          postHtml += '</div>'
          
          return postHtml
        }).join('\n\n')

        setFormData(prev => ({
          ...prev,
          content: content
        }))
      }
    } catch (error) {
      toast.error('スレッドデータの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('タイトルと内容は必須です')
      return
    }

    try {
      setIsSaving(true)
      
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          thread_id: threadId || null
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success('記事を作成しました')
        router.push('/admin/articles')
      } else {
        toast.error(data.error || '記事作成に失敗しました')
      }
    } catch (error) {
      toast.error('記事作成に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  // キーワード追加
  const addKeyword = (keyword: string) => {
    if (keyword && !formData.keywords.includes(keyword)) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword]
      }))
    }
  }

  // キーワード削除
  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  useEffect(() => {
    fetchCategories()
    fetchThreadData()
  }, [threadId])

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">新しい記事</h1>
            <p className="mt-2 text-gray-600">
              {thread ? `「${thread.title}」から記事を作成` : 'ブログ記事を作成します'}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-secondary flex items-center"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              {showPreview ? 'エディタ' : 'プレビュー'}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインエディタ */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    タイトル *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="input-field"
                    placeholder="記事のタイトルを入力..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    内容 *
                  </label>
                  {showPreview ? (
                    <div 
                      className="border border-gray-300 rounded-md p-4 min-h-64 bg-gray-50"
                      dangerouslySetInnerHTML={{ __html: formData.content }}
                    />
                  ) : (
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      className="input-field min-h-64"
                      placeholder="記事の内容を入力..."
                      required
                    />
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 公開設定 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">公開設定</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ステータス
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                    className="input-field"
                  >
                    <option value="draft">下書き</option>
                    <option value="published">公開</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    カテゴリ
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                    className="input-field"
                    required
                  >
                    <option value="">カテゴリを選択</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary flex items-center flex-1 justify-center"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  {isSaving ? '保存中...' : '保存'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn-secondary"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* SEO設定 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO設定</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メタディスクリプション
                  </label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    className="input-field"
                    rows={3}
                    placeholder="検索結果に表示される説明文..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    キーワード
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.keywords.map(keyword => (
                      <span
                        key={keyword}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="キーワードを入力してEnter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addKeyword((e.target as HTMLInputElement).value.trim())
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 元スレッド情報 */}
            {thread && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">元スレッド</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>タイトル:</strong> {thread.title}</p>
                  <p><strong>板:</strong> {thread.board}</p>
                  <p><strong>レス数:</strong> {thread.post_count}</p>
                  <p><strong>選択レス:</strong> {selectedPosts.length}件</p>
                  <a
                    href={thread.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    元スレを表示 →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </AdminLayout>
  )
}

export default function NewArticlePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewArticleContent />
    </Suspense>
  )
}