'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export function GoogleAnalytics({ gaId }: { gaId: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!gaId) return

    // Google Analytics スクリプトを動的に読み込み
    const script1 = document.createElement('script')
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(script1)

    const script2 = document.createElement('script')
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}', {
        page_path: window.location.pathname,
      });
    `
    document.head.appendChild(script2)

    return () => {
      // クリーンアップ
      document.head.removeChild(script1)
      document.head.removeChild(script2)
    }
  }, [gaId])

  useEffect(() => {
    if (!gaId || typeof window.gtag === 'undefined') return

    const url = pathname + searchParams.toString()
    
    // ページビューを送信
    window.gtag('config', gaId, {
      page_path: url,
    })
  }, [pathname, searchParams, gaId])

  return null
}