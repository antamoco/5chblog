import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { createDefaultScraper, createScraperWithSettings } from '@/lib/fivech-scraper'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  console.log('=== Thread Collection API Called ===')
  try {
    // 認証チェック
    console.log('Checking authentication...')
    await requireAuth(request)
    console.log('Authentication successful')

    // 収集設定を取得
    console.log('Fetching collection settings...')
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('collection_settings')
      .select('*')
      .single()

    let scraper
    if (settingsError || !settings) {
      console.log('Using default settings')
      scraper = createDefaultScraper()
    } else {
      console.log('Using custom settings:', settings)
      scraper = createScraperWithSettings({
        target_boards: settings.target_boards || ['livegalileo', 'news4vip'],
        min_post_count: settings.min_post_count || 100
      })
    }
    
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
    const { data: settingsData } = await supabaseAdmin
      .from('collection_settings')
      .select('id')
      .single()
    
    if (settingsData?.id) {
      await supabaseAdmin
        .from('collection_settings')
        .update({ last_collection_at: new Date().toISOString() })
        .eq('id', settingsData.id)
    }

    console.log(`${scrapedThreads.length}件のスレッドを収集しました`)

    return NextResponse.json({
      message: `${scrapedThreads.length}件のスレッドを収集しました`,
      collected_threads: insertedThreads || [],
      total_count: scrapedThreads.length
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