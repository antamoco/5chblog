import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'

// Note: Uses NextAuth.js getServerSession, keeping it on Node.js runtime

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .single()

    if (error) {
      // テーブルが存在しない場合はデフォルト値を返す
      if ((error as any).code === 'PGRST116' || (error instanceof Error && (error.message.includes('relation') || error.message.includes('does not exist')))) {
        return NextResponse.json({
          site_name: '5ch.sc まとめブログ',
          site_description: '5ch.scの人気スレッドをまとめたブログサイト',
          site_url: 'http://localhost:3000',
          admin_email: '',
          google_analytics_id: '',
          google_adsense_client_id: '',
          posts_per_page: 10,
          auto_approve_comments: false,
          enable_comments: true,
          enable_rss: true,
        })
      }
      console.error('Site settings fetch error:', error)
      return NextResponse.json({ error: 'データベースエラー' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Site settings GET error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const settings = await request.json()

    // 既存の設定があるかチェック
    const { data: existing } = await supabaseAdmin
      .from('site_settings')
      .select('id')
      .single()

    let result
    if (existing) {
      // 更新
      result = await supabaseAdmin
        .from('site_settings')
        .update(settings)
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      // 新規作成
      result = await supabaseAdmin
        .from('site_settings')
        .insert(settings)
        .select()
        .single()
    }

    if (result.error) {
      console.error('Site settings save error:', result.error)
      return NextResponse.json({ error: 'データベースエラー' }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Site settings POST error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}