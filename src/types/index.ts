// データベース型定義

export interface Thread {
  id: string
  title: string
  url: string
  board: string
  post_count: number
  created_at: string
  updated_at: string
  last_collected_at?: string
  status: 'active' | 'archived' | 'deleted'
}

export interface Post {
  id: string
  thread_id: string
  post_number: number
  author: string
  content: string
  posted_at: string
  is_selected: boolean
  display_order?: number | null
  style_config?: PostStyleConfig
  // スクレイピング用の一時的フィールド（DBには保存されない）
  post_id?: string
  raw_date?: string
}

export interface PostStyleConfig {
  color?: 'red' | 'blue' | 'green' | 'black' | 'purple'
  fontSize?: 'small' | 'medium' | 'large'
  fontWeight?: 'normal' | 'bold'
  fontStyle?: 'normal' | 'italic'
}

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  category_id: string
  thread_id?: string
  status: 'draft' | 'published' | 'archived'
  published_at?: string
  created_at: string
  updated_at: string
  view_count: number
  comment_count: number
  meta_description?: string
  og_image?: string
  keywords?: string[]
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  order_index: number
  created_at: string
}

export interface Comment {
  id: string
  article_id: string
  author_name: string
  author_email?: string
  content: string
  status: 'pending' | 'approved' | 'rejected' | 'spam'
  created_at: string
  parent_id?: string
  replies?: Comment[]
}

export interface SiteSettings {
  id: string
  site_name: string
  site_description: string
  site_url: string
  admin_email: string
  google_analytics_id?: string
  google_adsense_client_id?: string
  posts_per_page: number
  auto_approve_comments: boolean
  enable_comments: boolean
  enable_rss: boolean
  updated_at: string
}

// API型定義

export interface ThreadCollectionResult {
  success: boolean
  collected_threads: Thread[]
  total_count: number
  error?: string
}

export interface FiveChApiResponse {
  threads: Array<{
    title: string
    url: string
    post_count: number
    created_at: string
  }>
  board: string
  total: number
}

export interface PostContent {
  id: string
  number: number
  author: string
  content: string
  posted_at: string
  images?: string[]
}

// UI型定義

export interface ArticleCardProps {
  title: string
  excerpt: string
  category: string
  publishedAt: string
  slug: string
  commentCount: number
  viewCount?: number
  thumbnailUrl?: string
}

export interface AdminSidebarItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  current: boolean
}

export interface ThreadFilterOptions {
  board?: string
  date_range?: {
    start: string
    end: string
  }
  min_post_count?: number
  max_post_count?: number
  status?: Thread['status']
}

export interface ArticleFilterOptions {
  category_id?: string
  status?: Article['status']
  date_range?: {
    start: string
    end: string
  }
  search?: string
}

// フォーム型定義

export interface ThreadCollectionSettings {
  target_boards: string[]
  min_post_count: number
  collection_interval: number // 時間単位
  auto_collection_enabled: boolean
}

export interface ArticleForm {
  title: string
  content: string
  excerpt: string
  category_id: string
  status: Article['status']
  published_at?: string
  meta_description?: string
  og_image?: string
  keywords?: string[]
}

export interface CategoryForm {
  name: string
  slug: string
  description?: string
  color?: string
}

export interface SettingsForm {
  site_name: string
  site_description: string
  admin_email: string
  google_analytics_id?: string
  google_adsense_client_id?: string
  posts_per_page: number
  auto_approve_comments: boolean
  enable_comments: boolean
  enable_rss: boolean
}