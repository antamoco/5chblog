import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('collection_settings')
      .select('*')
      .single()

    if (error) {
      // テーブルが存在しない場合はデフォルト値を返す
      if ((error as any).code === 'PGRST116' || (error instanceof Error && (error.message.includes('relation') || error.message.includes('does not exist')))) {
        return NextResponse.json({
          target_boards: ['livegalileo', 'news4vip'],
          min_post_count: 100,
          collection_interval: 24,
          auto_collection_enabled: true,
        })
      }
      console.error('Collection settings fetch error:', error)
      return NextResponse.json({ error: 'データベースエラー' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Collection settings GET error:', error)
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
      .from('collection_settings')
      .select('id')
      .single()

    let result
    if (existing) {
      // 更新
      result = await supabaseAdmin
        .from('collection_settings')
        .update(settings)
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      // 新規作成
      result = await supabaseAdmin
        .from('collection_settings')
        .insert(settings)
        .select()
        .single()
    }

    if (result.error) {
      console.error('Collection settings save error:', result.error)
      return NextResponse.json({ error: 'データベースエラー' }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Collection settings POST error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}