import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id

    const { data: article, error } = await supabaseAdmin
      .from('articles')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          slug
        )
      `)
      .eq('id', articleId)
      .single()

    if (error || !article) {
      return NextResponse.json({ error: '記事が見つかりません' }, { status: 404 })
    }

    return NextResponse.json({
      article
    })
  } catch (error) {
    console.error('Get article error:', error)
    return NextResponse.json({ 
      error: '記事取得に失敗しました' 
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

    const articleId = params.id
    const body = await request.json()
    const {
      title,
      content,
      category_id,
      status = 'draft',
      meta_description,
      keywords
    } = body

    // スラッグ生成（簡易版）
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    const updateData = {
      title,
      slug,
      content,
      category_id,
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
      meta_description,
      keywords,
      updated_at: new Date().toISOString()
    }

    const { data: article, error } = await supabaseAdmin
      .from('articles')
      .update(updateData)
      .eq('id', articleId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'データベースエラー' }, { status: 500 })
    }

    return NextResponse.json({
      message: '記事を更新しました',
      article
    })
  } catch (error) {
    console.error('Update article error:', error)
    return NextResponse.json({ 
      error: '記事更新に失敗しました' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const articleId = params.id

    // 記事を削除
    const { error } = await supabaseAdmin
      .from('articles')
      .delete()
      .eq('id', articleId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'データベースエラー' }, { status: 500 })
    }

    return NextResponse.json({
      message: '記事を削除しました'
    })
  } catch (error) {
    console.error('Delete article error:', error)
    return NextResponse.json({ 
      error: '記事削除に失敗しました' 
    }, { status: 500 })
  }
}