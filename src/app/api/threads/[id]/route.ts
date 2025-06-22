import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const threadId = params.id

    // スレッド詳細を取得
    const { data: thread, error } = await supabaseAdmin
      .from('threads')
      .select('*')
      .eq('id', threadId)
      .single()

    if (error) {
      console.error('Thread fetch error:', error)
      return NextResponse.json({ error: 'スレッドが見つかりません' }, { status: 404 })
    }

    return NextResponse.json({ thread })
  } catch (error) {
    console.error('Get thread error:', error)
    return NextResponse.json({ 
      error: 'スレッド取得に失敗しました' 
    }, { status: 500 })
  }
}