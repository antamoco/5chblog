import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    // 最新の公開記事を取得
    const { data: articles, error } = await supabaseAdmin
      .from('articles')
      .select(`
        *,
        categories:category_id (
          name
        )
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('RSS fetch error:', error)
      return new NextResponse('Internal Server Error', { status: 500 })
    }

    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>5ch.sc まとめブログ</title>
    <link>${baseUrl}</link>
    <description>5ch.scの人気スレッドをまとめたブログサイト</description>
    <language>ja-JP</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml" />
    
    ${(articles || []).map(article => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${baseUrl}/articles/${article.slug}</link>
      <description><![CDATA[${article.excerpt || ''}]]></description>
      <category>${article.categories?.name || ''}</category>
      <pubDate>${new Date(article.published_at || article.created_at).toUTCString()}</pubDate>
      <guid isPermaLink="true">${baseUrl}/articles/${article.slug}</guid>
    </item>
    `).join('')}
  </channel>
</rss>`

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/rss+xml',
        'Cache-Control': 's-maxage=86400, stale-while-revalidate',
      },
    })
  } catch (error) {
    console.error('RSS generation error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}