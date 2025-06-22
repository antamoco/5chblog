import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

/**
 * 画像プロキシAPI - CORS回避のため
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')
  const isTest = searchParams.get('test') === 'true'
  
  if (!imageUrl) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }
  
  try {
    // URL検証
    const url = new URL(imageUrl)
    
    // 許可されたホストのみ
    const allowedHosts = [
      'imgur.com',
      'i.imgur.com',
      'pbs.twimg.com',
      'img.5ch.net',
      'i.redd.it',
      'cdn.discordapp.com',
      // 必要に応じて追加
    ]
    
    const isAllowed = allowedHosts.some(host => 
      url.hostname === host || url.hostname.endsWith('.' + host)
    )
    
    if (!isAllowed) {
      return NextResponse.json({ error: 'Host not allowed' }, { status: 403 })
    }
    
    // テストリクエストの場合
    if (isTest) {
      const headResponse = await fetch(imageUrl, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      return NextResponse.json({ 
        accessible: headResponse.ok,
        contentType: headResponse.headers.get('content-type'),
        contentLength: headResponse.headers.get('content-length')
      })
    }
    
    // 画像取得
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': url.origin,
      },
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }
    
    // Content-Typeチェック
    const contentType = response.headers.get('content-type')
    if (!contentType?.startsWith('image/')) {
      return NextResponse.json({ error: 'Not an image' }, { status: 400 })
    }
    
    // 画像サイズ制限（10MB）
    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large' }, { status: 413 })
    }
    
    // レスポンス作成
    const imageBuffer = await response.arrayBuffer()
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
    
  } catch (error) {
    console.error('Image proxy error:', error)
    
    // エラー画像を返す（オプション）
    return NextResponse.json({ 
      error: 'Failed to load image',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// OPTIONSリクエスト対応
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}