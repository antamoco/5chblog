'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { 
  ChatBubbleLeftIcon, 
  PaperAirplaneIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { Comment } from '@/types'

interface CommentSectionProps {
  articleId: string
}

export function CommentSection({ articleId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newComment, setNewComment] = useState({
    author_name: '',
    author_email: '',
    content: ''
  })

  // コメント一覧を取得
  const fetchComments = async () => {
    try {
      setIsLoading(true)
      // TODO: APIからコメント取得
      // 仮のデータ
      setComments([
        {
          id: '1',
          article_id: articleId,
          author_name: '名無しさん',
          content: 'とても興味深い記事でした！',
          status: 'approved',
          created_at: new Date(Date.now() - 3600000).toISOString(), // 1時間前
        },
        {
          id: '2',
          article_id: articleId,
          author_name: '通りすがり',
          content: 'スレの選択が上手ですね。読みやすかったです。',
          status: 'approved',
          created_at: new Date(Date.now() - 7200000).toISOString(), // 2時間前
        },
      ])
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // コメント投稿
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.author_name.trim() || !newComment.content.trim()) {
      toast.error('名前とコメントは必須です')
      return
    }

    try {
      setIsSubmitting(true)
      
      // TODO: APIにコメント投稿
      // 仮の処理
      const comment: Comment = {
        id: Date.now().toString(),
        article_id: articleId,
        author_name: newComment.author_name,
        author_email: newComment.author_email,
        content: newComment.content,
        status: 'pending',
        created_at: new Date().toISOString(),
      }

      // 仮でローカルに追加（実際はAPIから最新データを取得）
      setComments(prev => [comment, ...prev])
      
      setNewComment({
        author_name: '',
        author_email: '',
        content: ''
      })

      toast.success('コメントを投稿しました。承認後に表示されます。')
    } catch (error) {
      toast.error('コメント投稿に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  useEffect(() => {
    fetchComments()
  }, [articleId])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="flex items-center mb-6">
        <ChatBubbleLeftIcon className="h-6 w-6 text-gray-500 mr-3" />
        <h2 className="text-xl font-bold text-gray-900">
          コメント ({comments.filter(c => c.status === 'approved').length})
        </h2>
      </div>

      {/* コメント投稿フォーム */}
      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">コメントを投稿</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              名前 *
            </label>
            <input
              type="text"
              value={newComment.author_name}
              onChange={(e) => setNewComment(prev => ({ ...prev, author_name: e.target.value }))}
              className="input-field"
              placeholder="お名前"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス（任意）
            </label>
            <input
              type="email"
              value={newComment.author_email}
              onChange={(e) => setNewComment(prev => ({ ...prev, author_email: e.target.value }))}
              className="input-field"
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            コメント *
          </label>
          <textarea
            value={newComment.content}
            onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
            className="input-field"
            rows={4}
            placeholder="コメントを入力してください..."
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center"
          >
            <PaperAirplaneIcon className="h-4 w-4 mr-2" />
            {isSubmitting ? '投稿中...' : 'コメント投稿'}
          </button>
        </div>
      </form>

      {/* コメント一覧 */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      ) : comments.filter(c => c.status === 'approved').length === 0 ? (
        <div className="text-center py-8">
          <ChatBubbleLeftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">まだコメントがありません</p>
          <p className="text-sm text-gray-500 mt-1">最初のコメントを投稿してみませんか？</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments
            .filter(comment => comment.status === 'approved')
            .map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {comment.author_name}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  )
}