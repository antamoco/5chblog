import Link from 'next/link'
import { CalendarIcon, EyeIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { ArticleCardProps } from '@/types'

export function ArticleCard({
  title,
  excerpt,
  category,
  publishedAt,
  slug,
  commentCount,
  viewCount = 0,
  thumbnailUrl
}: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <article className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {thumbnailUrl && (
        <div className="aspect-video bg-gray-200">
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {category}
          </span>
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {formatDate(publishedAt)}
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600">
          <Link href={`/articles/${slug}`}>
            {title}
          </Link>
        </h2>

        <p className="text-gray-600 mb-4 line-clamp-3">
          {excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <EyeIcon className="h-4 w-4 mr-1" />
              {viewCount.toLocaleString()}
            </div>
            <div className="flex items-center">
              <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
              {commentCount}
            </div>
          </div>
          
          <Link
            href={`/articles/${slug}`}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            続きを読む →
          </Link>
        </div>
      </div>
    </article>
  )
}