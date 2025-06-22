import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'データベースエラー' }, { status: 500 })
    }

    return NextResponse.json({
      categories: categories || []
    })
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json({ 
      error: 'カテゴリ取得に失敗しました' 
    }, { status: 500 })
  }
}