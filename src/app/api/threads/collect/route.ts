import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'
import { createDefaultScraper } from '@/lib/fivech-scraper'

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const scraper = createDefaultScraper()
    
    // スレッド収集実行
    console.log('スレッド収集を開始...')
    const scrapedThreads = await scraper.collectThreads()
    
    if (scrapedThreads.length === 0) {
      return NextResponse.json({ 
        message: '収集できるスレッドがありませんでした',
        collected_threads: [],
        total_count: 0
      })
    }

    // データベースに保存
    const threadsToInsert = scrapedThreads.map(thread => ({
      title: thread.title,
      url: thread.url,
      board: thread.board,
      post_count: thread.postCount,
      status: 'active',
      last_collected_at: new Date().toISOString(),
    }))

    const { data: insertedThreads, error } = await supabaseAdmin
      .from('threads')
      .upsert(threadsToInsert, {
        onConflict: 'url',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'データベースエラー' }, { status: 500 })
    }

    // 収集設定の最終収集日時を更新
    await supabaseAdmin
      .from('collection_settings')
      .update({ last_collection_at: new Date().toISOString() })
      .eq('id', (await supabaseAdmin.from('collection_settings').select('id').single()).data?.id)

    console.log(`${scrapedThreads.length}件のスレッドを収集しました`)

    return NextResponse.json({
      message: `${scrapedThreads.length}件のスレッドを収集しました`,
      collected_threads: insertedThreads || [],
      total_count: scrapedThreads.length
    })

  } catch (error) {
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