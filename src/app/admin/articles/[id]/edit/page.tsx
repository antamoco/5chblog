'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { 
  DocumentTextIcon, 
  EyeIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Category, Article } from '@/types'

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const articleId = params.id as string

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    status: 'draft' as 'draft' | 'published',
    meta_description: '',
    keywords: [] as string[]
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [article, setArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // 記事データを取得
  const fetchArticle = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/articles/${articleId}`)
      if (response.ok) {
        const data = await response.json()
        const articleData = data.article
        setArticle(articleData)
        setFormData({
          title: articleData.title || '',
          content: articleData.content || '',
          category_id: articleData.category_id || '',
          status: articleData.status || 'draft',
          meta_description: articleData.meta_description || '',
          keywords: articleData.keywords || []
        })
      } else {
        toast.error('記事の取得に失敗しました')
        router.push('/admin/articles')
      }
    } catch (error) {
      toast.error('記事の取得に失敗しました')
      router.push('/admin/articles')
    } finally {
      setIsLoading(false)
    }
  }

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

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('タイトルと内容は必須です')
      return
    }

    try {
      setIsSaving(true)
      
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success('記事を更新しました')
        router.push('/admin/articles')
      } else {
        toast.error(data.error || '記事更新に失敗しました')
      }
    } catch (error) {
      toast.error('記事更新に失敗しました')
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
    fetchArticle()
  }, [articleId])

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!article) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-gray-600">記事が見つかりません</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">記事編集</h1>
            <p className="mt-2 text-gray-600">
              「{article.title}」を編集しています
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
                  {isSaving ? '保存中...' : '更新'}
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
          </div>
        </div>
      </form>
    </AdminLayout>
  )
}