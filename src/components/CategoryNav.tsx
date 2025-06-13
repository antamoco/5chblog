'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Category } from '@/types'

export function CategoryNav() {
  const pathname = usePathname()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    // TODO: APIからカテゴリ一覧を取得
    // 仮のデータ
    setCategories([
      { id: '1', name: 'すべて', slug: 'all', order_index: 0, created_at: '' },
      { id: '2', name: 'ニュース', slug: 'news', order_index: 1, created_at: '' },
      { id: '3', name: '雑談', slug: 'chat', order_index: 2, created_at: '' },
      { id: '4', name: 'ゲーム', slug: 'game', order_index: 3, created_at: '' },
      { id: '5', name: 'アニメ・漫画', slug: 'anime', order_index: 4, created_at: '' },
      { id: '6', name: 'スポーツ', slug: 'sports', order_index: 5, created_at: '' },
    ])
  }, [])

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {categories.map((category) => {
            const href = category.slug === 'all' ? '/' : `/category/${category.slug}`
            const isActive = pathname === href
            
            return (
              <Link
                key={category.id}
                href={href}
                className={`${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {category.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}