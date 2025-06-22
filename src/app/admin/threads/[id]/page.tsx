'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { 
  DocumentTextIcon, 
  PaintBrushIcon,
  EyeIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { Thread, Post, PostStyleConfig } from '@/types'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

export default function ThreadDetailPage() {
  const params = useParams()
  const threadId = params.id as string
  
  const [thread, setThread] = useState<Thread | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [postStyles, setPostStyles] = useState<{ [key: string]: PostStyleConfig }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // スレッド詳細とレスを取得
  const fetchThreadData = async () => {
    try {
      setIsLoading(true)
      
      // スレッド詳細を取得
      const threadResponse = await fetch(`/api/threads/${threadId}`)
      if (threadResponse.ok) {
        const threadData = await threadResponse.json()
        setThread(threadData.thread)
      }

      // レス一覧を取得
      const postsResponse = await fetch(`/api/threads/${threadId}/posts`)
      const postsData = await postsResponse.json()
      
      if (postsResponse.ok) {
        setPosts(postsData.posts || [])
        
        // 選択済みレスを設定
        const selected = postsData.posts
          .filter((post: Post) => post.is_selected)
          .sort((a: Post, b: Post) => (a.display_order || 0) - (b.display_order || 0))
          .map((post: Post) => post.id)
        setSelectedPosts(selected)

        // スタイル設定を復元
        const styles: { [key: string]: PostStyleConfig } = {}
        postsData.posts.forEach((post: Post) => {
          if (post.style_config && Object.keys(post.style_config).length > 0) {
            styles[post.id] = post.style_config
          }
        })
        setPostStyles(styles)
      } else {
        toast.error(postsData.error || 'レス取得に失敗しました')
      }
    } catch (error) {
      toast.error('データ取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // レス選択を切り替え
  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev => {
      if (prev.includes(postId)) {
        return prev.filter(id => id !== postId)
      } else {
        return [...prev, postId]
      }
    })
  }

  // レススタイルを変更
  const updatePostStyle = (postId: string, styleKey: keyof PostStyleConfig, value: string) => {
    setPostStyles(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        [styleKey]: value
      }
    }))
  }

  // ドラッグ&ドロップでの並び替え
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(selectedPosts)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSelectedPosts(items)
  }

  // 選択とスタイルを保存
  const saveSelection = async () => {
    try {
      setIsSaving(true)
      
      const response = await fetch(`/api/threads/${threadId}/posts`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedPosts,
          postStyles
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success('レス選択を保存しました')
      } else {
        toast.error(data.error || '保存に失敗しました')
      }
    } catch (error) {
      toast.error('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  // 記事作成画面へ遷移
  const createArticle = () => {
    const params = new URLSearchParams({
      threadId,
      selectedPosts: selectedPosts.join(',')
    })
    window.open(`/admin/articles/new?${params}`, '_blank')
  }

  useEffect(() => {
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
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {thread?.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>板: {thread?.board}</span>
              <span>レス数: {thread?.post_count}</span>
              <span>選択済み: {selectedPosts.length}</span>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={saveSelection}
              disabled={isSaving}
              className="btn-secondary flex items-center"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              {isSaving ? '保存中...' : '選択を保存'}
            </button>
            <button
              onClick={createArticle}
              disabled={selectedPosts.length === 0}
              className="btn-primary flex items-center"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              記事を作成
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* レス一覧 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">全レス ({posts.length}件)</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedPosts.includes(post.id) ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => togglePostSelection(post.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {post.post_number}
                      </span>
                      <span className="text-sm text-gray-500">{post.author}</span>
                    </div>
                    {selectedPosts.includes(post.id) && (
                      <CheckIcon className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 選択済みレスとプレビュー */}
        <div className="space-y-6">
          {/* 選択済みレス */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">選択済みレス ({selectedPosts.length}件)</h2>
            </div>
            <div className="p-4 max-h-64 overflow-y-auto">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="selected-posts">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {selectedPosts.map((postId, index) => {
                        const post = posts.find(p => p.id === postId)
                        if (!post) return null

                        return (
                          <Draggable key={postId} draggableId={postId} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-2 p-3 bg-gray-50 rounded border text-sm"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium">{post.post_number}番</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      togglePostSelection(postId)
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    削除
                                  </button>
                                </div>
                                <p className="mt-1 text-gray-600 line-clamp-2 mb-2">
                                  {post.content}
                                </p>
                                <div className="flex space-x-2 text-xs">
                                  <select
                                    value={postStyles[postId]?.color || 'black'}
                                    onChange={(e) => updatePostStyle(postId, 'color', e.target.value)}
                                    className="px-2 py-1 border rounded text-xs"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <option value="black">黒</option>
                                    <option value="red">赤</option>
                                    <option value="blue">青</option>
                                    <option value="green">緑</option>
                                    <option value="purple">紫</option>
                                  </select>
                                  <select
                                    value={postStyles[postId]?.fontSize || 'medium'}
                                    onChange={(e) => updatePostStyle(postId, 'fontSize', e.target.value)}
                                    className="px-2 py-1 border rounded text-xs"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <option value="small">小</option>
                                    <option value="medium">標準</option>
                                    <option value="large">大</option>
                                  </select>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>

          {/* スタイル設定 - 一括設定 */}
          {selectedPosts.length > 1 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold flex items-center">
                  <PaintBrushIcon className="h-5 w-5 mr-2" />
                  一括スタイル設定
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    選択中のレス全体の文字色
                  </label>
                  <select
                    onChange={(e) => {
                      selectedPosts.forEach(postId => {
                        updatePostStyle(postId, 'color', e.target.value)
                      })
                    }}
                    className="input-field"
                  >
                    <option value="">選択してください</option>
                    <option value="black">黒</option>
                    <option value="red">赤</option>
                    <option value="blue">青</option>
                    <option value="green">緑</option>
                    <option value="purple">紫</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    選択中のレス全体のフォントサイズ
                  </label>
                  <select
                    onChange={(e) => {
                      selectedPosts.forEach(postId => {
                        updatePostStyle(postId, 'fontSize', e.target.value)
                      })
                    }}
                    className="input-field"
                  >
                    <option value="">選択してください</option>
                    <option value="small">小</option>
                    <option value="medium">標準</option>
                    <option value="large">大</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}