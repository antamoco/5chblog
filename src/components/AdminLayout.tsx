'use client'

import { ReactNode } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  DocumentTextIcon,
  CollectionIcon,
  CogIcon,
  UserIcon,
  LogoutIcon,
} from '@heroicons/react/24/outline'

interface AdminLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'ダッシュボード', href: '/admin', icon: HomeIcon },
  { name: 'スレッド収集', href: '/admin/threads', icon: CollectionIcon },
  { name: '記事管理', href: '/admin/articles', icon: DocumentTextIcon },
  { name: '設定', href: '/admin/settings', icon: CogIcon },
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/admin/login')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* サイドバー */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-800">
        <div className="flex flex-col h-full">
          {/* ロゴ */}
          <div className="flex items-center h-16 px-4 bg-gray-900">
            <h1 className="text-white text-lg font-semibold">
              管理画面
            </h1>
          </div>

          {/* ナビゲーション */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <item.icon
                    className={`${
                      isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                    } mr-3 h-6 w-6`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* ユーザー情報 */}
          <div className="flex-shrink-0 flex bg-gray-700 p-4">
            <div className="flex items-center">
              <div>
                <UserIcon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{session.user?.email}</p>
                <button
                  onClick={() => signOut()}
                  className="text-xs text-gray-400 hover:text-white flex items-center"
                >
                  <LogoutIcon className="h-4 w-4 mr-1" />
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="pl-64">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}