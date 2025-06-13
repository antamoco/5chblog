import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'
import { createDefaultScraper } from '@/lib/fivech-scraper'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const threadId = params.id

    // 既存のレスを確認
    const { data: existingPosts } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('thread_id', threadId)
      .order('post_number')

    if (existingPosts && existingPosts.length > 0) {
      return NextResponse.json({ posts: existingPosts })
    }

    // レスが存在しない場合は、スレッド情報を取得してスクレイピング
    const { data: thread } = await supabaseAdmin
      .from('threads')
      .select('*')
      .eq('id', threadId)
      .single()

    if (!thread) {
      return NextResponse.json({ error: 'スレッドが見つかりません' }, { status: 404 })
    }

    // 認証チェック（スクレイピングには認証が必要）
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // スレッドからレスを取得
    const scraper = createDefaultScraper()
    const scrapedPosts = await scraper.scrapeThreadPosts(thread.url)

    if (scrapedPosts.length === 0) {
      return NextResponse.json({ 
        message: 'レスを取得できませんでした',
        posts: []
      })
    }

    // データベースに保存
    const postsToInsert = scrapedPosts.map(post => ({
      thread_id: threadId,
      post_number: post.post_number,
      author: post.author,
      content: post.content,
      posted_at: post.posted_at,
      is_selected: false,
    }))

    const { data: insertedPosts, error } = await supabaseAdmin
      .from('posts')
      .insert(postsToInsert)
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'データベースエラー' }, { status: 500 })
    }

    // スレッドのpost_countを更新
    await supabaseAdmin
      .from('threads')
      .update({ post_count: scrapedPosts.length })
      .eq('id', threadId)

    return NextResponse.json({ 
      posts: insertedPosts,
      message: `${scrapedPosts.length}件のレスを取得しました`
    })

  } catch (error) {
    console.error('Get thread posts error:', error)
    return NextResponse.json({ 
      error: 'レス取得に失敗しました' 
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const threadId = params.id
    const body = await request.json()
    const { selectedPosts, postStyles } = body

    // 選択されたレスの情報を更新
    for (const postId of selectedPosts) {
      const style = postStyles[postId] || {}
      
      await supabaseAdmin
        .from('posts')
        .update({
          is_selected: true,
          style_config: style,
          display_order: selectedPosts.indexOf(postId) + 1
        })
        .eq('id', postId)
        .eq('thread_id', threadId)
    }

    // 選択解除されたレスを更新
    await supabaseAdmin
      .from('posts')
      .update({
        is_selected: false,
        display_order: null
      })
      .eq('thread_id', threadId)
      .not('id', 'in', `(${selectedPosts.join(',')})`)

    return NextResponse.json({ 
      message: 'レス選択を保存しました'
    })

  } catch (error) {
    console.error('Update post selection error:', error)
    return NextResponse.json({ 
      error: 'レス選択の保存に失敗しました' 
    }, { status: 500 })
  }
}