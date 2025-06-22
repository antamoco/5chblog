import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export const runtime = 'edge'

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

    // TODO: スクレイピング機能は後で実装
    // 現在はCloudflare Pages対応のため無効化
    
    return NextResponse.json({ 
      posts: [],
      message: 'スクレイピング機能は準備中です'
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
    await requireAuth(request)

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