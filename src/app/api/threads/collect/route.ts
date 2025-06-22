import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    await requireAuth(request)

    // TODO: スクレイピング機能は後で実装
    // 現在はCloudflare Pages対応のため無効化
    return NextResponse.json({ 
      message: 'スクレイピング機能は準備中です',
      collected_threads: [],
      total_count: 0
    })

  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }
    
    console.error('Thread collection error:', error)
    return NextResponse.json({ 
      error: 'スレッド収集に失敗しました' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // 収集済みスレッド一覧を取得
    const { data: threads, error } = await supabaseAdmin
      .from('threads')
      .select('*')
      .order('last_collected_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: 'データベースエラー' }, { status: 500 })
    }

    return NextResponse.json({ threads })
  } catch (error) {
    console.error('Get threads error:', error)
    return NextResponse.json({ 
      error: 'スレッド取得に失敗しました' 
    }, { status: 500 })
  }
}