-- 5ch.sc まとめブログ データベーススキーマ

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- カテゴリテーブル
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT '#3b82f6',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- スレッドテーブル
CREATE TABLE threads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    board VARCHAR(50) NOT NULL,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_collected_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted'))
);

-- レステーブル
CREATE TABLE posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
    post_number INTEGER NOT NULL,
    author VARCHAR(100) DEFAULT '名無しさん',
    content TEXT NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_selected BOOLEAN DEFAULT FALSE,
    display_order INTEGER,
    style_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(thread_id, post_number)
);

-- 記事テーブル
CREATE TABLE articles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    thread_id UUID REFERENCES threads(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    view_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    meta_description TEXT,
    og_image TEXT,
    keywords TEXT[]
);

-- コメントテーブル
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    ip_address INET
);

-- サイト設定テーブル
CREATE TABLE site_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    site_name VARCHAR(200) DEFAULT '5ch.sc まとめブログ',
    site_description TEXT DEFAULT '5ch.scの人気スレッドをまとめたブログサイト',
    site_url VARCHAR(255) DEFAULT 'http://localhost:3000',
    admin_email VARCHAR(255) NOT NULL,
    google_analytics_id VARCHAR(50),
    google_adsense_client_id VARCHAR(100),
    posts_per_page INTEGER DEFAULT 10,
    auto_approve_comments BOOLEAN DEFAULT FALSE,
    enable_comments BOOLEAN DEFAULT TRUE,
    enable_rss BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- スレッド収集設定テーブル
CREATE TABLE collection_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    target_boards TEXT[] DEFAULT ARRAY['livegalileo', 'news4vip'],
    min_post_count INTEGER DEFAULT 100,
    collection_interval INTEGER DEFAULT 24, -- 時間単位
    auto_collection_enabled BOOLEAN DEFAULT TRUE,
    last_collection_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_threads_board ON threads(board);
CREATE INDEX idx_threads_status ON threads(status);
CREATE INDEX idx_threads_created_at ON threads(created_at DESC);
CREATE INDEX idx_threads_post_count ON threads(post_count DESC);

CREATE INDEX idx_posts_thread_id ON posts(thread_id);
CREATE INDEX idx_posts_is_selected ON posts(is_selected) WHERE is_selected = TRUE;
CREATE INDEX idx_posts_display_order ON posts(display_order) WHERE display_order IS NOT NULL;

CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category_id ON articles(category_id);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_articles_slug ON articles(slug);

CREATE INDEX idx_comments_article_id ON comments(article_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- トリガー関数：updated_atの自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガー設定
CREATE TRIGGER update_threads_updated_at BEFORE UPDATE ON threads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collection_settings_updated_at BEFORE UPDATE ON collection_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 記事のコメント数を自動更新する関数
CREATE OR REPLACE FUNCTION update_article_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE articles 
        SET comment_count = comment_count + 1 
        WHERE id = NEW.article_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE articles 
        SET comment_count = comment_count - 1 
        WHERE id = OLD.article_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- コメント数更新トリガー
CREATE TRIGGER update_comment_count_on_insert 
    AFTER INSERT ON comments 
    FOR EACH ROW EXECUTE FUNCTION update_article_comment_count();

CREATE TRIGGER update_comment_count_on_delete 
    AFTER DELETE ON comments 
    FOR EACH ROW EXECUTE FUNCTION update_article_comment_count();

-- 初期データ挿入
INSERT INTO categories (name, slug, description, color, order_index) VALUES
('ニュース', 'news', '時事ニュースや社会問題', '#ef4444', 1),
('雑談', 'chat', '日常会話や雑談', '#3b82f6', 2),
('ゲーム', 'game', 'ゲーム関連の話題', '#10b981', 3),
('アニメ・漫画', 'anime', 'アニメや漫画の話題', '#f59e0b', 4),
('スポーツ', 'sports', 'スポーツ関連', '#8b5cf6', 5),
('その他', 'other', 'その他の話題', '#6b7280', 6);

INSERT INTO site_settings (admin_email) VALUES ('admin@example.com');

INSERT INTO collection_settings DEFAULT VALUES;