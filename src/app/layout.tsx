import './globals.css'
import { Inter, Noto_Sans_JP } from 'next/font/google'
import { Providers } from './providers'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })
const notoSansJP = Noto_Sans_JP({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: '5ch.sc まとめブログ',
    template: '%s | 5ch.sc まとめブログ',
  },
  description: '5ch.scの人気スレッドをまとめたブログサイト',
  keywords: ['5ch', '2ch', 'まとめ', 'ブログ', 'スレッド'],
  authors: [{ name: '5ch.sc まとめブログ' }],
  creator: '5ch.sc まとめブログ',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: '5ch.sc まとめブログ',
    title: '5ch.sc まとめブログ',
    description: '5ch.scの人気スレッドをまとめたブログサイト',
  },
  twitter: {
    card: 'summary_large_image',
    title: '5ch.sc まとめブログ',
    description: '5ch.scの人気スレッドをまとめたブログサイト',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <html lang="ja">
      <head>
        {gaId && <GoogleAnalytics gaId={gaId} />}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className={`${inter.className} ${notoSansJP.className}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}