import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'

// Note: Uses NextAuth.js getServerSession, keeping it on Node.js runtime

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = supabaseAdmin
      .from('articles')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          slug
        )
      `)

    // フィルター適用
    if (category && category !== 'all') {
      query = query.eq('category_id', category)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    // 公開記事のみ（管理者以外）
    const session = await getServerSession()
    if (!session) {
      query = query.eq('status', 'published')
    }

    // ページネーション
    const offset = (page - 1) * limit
    query = query
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: articles, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'データベースエラー' }, { status: 500 })
    }

    return NextResponse.json({
      articles: articles || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    console.error('Get articles error:', error)
    return NextResponse.json({ 
      error: '記事取得に失敗しました' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      content,
      category_id,
      thread_id,
      status = 'draft',
      published_at,
      meta_description,
      og_image,
      keywords
    } = body

    // スラッグ生成（簡易版）
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    const articleData = {
      title,
      slug,
      content,
      category_id,
      thread_id: thread_id || null,
      status,
      published_at: status === 'published' ? (published_at || new Date().toISOString()) : null,
      meta_description,
      og_image,
      keywords
    }

    const { data: article, error } = await supabaseAdmin
      .from('articles')
      .insert(articleData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      console.error('Article data:', articleData)
      return NextResponse.json({ 
        error: 'データベースエラー', 
        details: error instanceof Error ? error.message : String(error),
        code: error.code 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: '記事を作成しました',
      article
    })
  } catch (error) {
    console.error('Create article error:', error)
    return NextResponse.json({ 
      error: '記事作成に失敗しました' 
    }, { status: 500 })
  }
}