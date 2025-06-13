import axios from 'axios'
import * as cheerio from 'cheerio'
import { Thread, Post } from '@/types'

interface ScrapingConfig {
  boards: string[]
  minPostCount: number
  maxThreads: number
}

interface ScrapedThread {
  title: string
  url: string
  postCount: number
  board: string
}

export class FiveChScraper {
  private readonly baseUrl = 'https://5ch.sc'
  private readonly config: ScrapingConfig

  constructor(config: ScrapingConfig) {
    this.config = config
  }

  /**
   * 指定された板からスレッド一覧を取得
   */
  async scrapeThreads(board: string): Promise<ScrapedThread[]> {
    try {
      const boardUrl = `${this.baseUrl}/${board}/`
      const response = await axios.get(boardUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      })

      const $ = cheerio.load(response.data)
      const threads: ScrapedThread[] = []

      // 5ch.scのスレッド一覧構造に合わせて調整
      $('tr').each((_, element) => {
        const $row = $(element)
        const $link = $row.find('a')
        const title = $link.text().trim()
        const href = $link.attr('href')
        
        if (title && href) {
          // レス数を抽出（通常は括弧内に記載）
          const postCountMatch = title.match(/\((\d+)\)/)
          const postCount = postCountMatch ? parseInt(postCountMatch[1]) : 0

          if (postCount >= this.config.minPostCount) {
            threads.push({
              title: title.replace(/\(\d+\)$/, '').trim(),
              url: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
              postCount,
              board,
            })
          }
        }
      })

      return threads
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, this.config.maxThreads)
    } catch (error) {
      console.error(`Error scraping board ${board}:`, error)
      return []
    }
  }

  /**
   * 全対象板からスレッドを収集
   */
  async collectThreads(): Promise<ScrapedThread[]> {
    const allThreads: ScrapedThread[] = []

    for (const board of this.config.boards) {
      console.log(`Scraping board: ${board}`)
      const boardThreads = await this.scrapeThreads(board)
      allThreads.push(...boardThreads)
      
      // レート制限を避けるため1秒待機
      await this.sleep(1000)
    }

    return allThreads
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, this.config.maxThreads * this.config.boards.length)
  }

  /**
   * 特定のスレッドから全レスを取得
   */
  async scrapeThreadPosts(threadUrl: string): Promise<Post[]> {
    try {
      const response = await axios.get(threadUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      })

      const $ = cheerio.load(response.data)
      const posts: Post[] = []

      // 5ch.scのレス構造に合わせて調整
      $('.post').each((index, element) => {
        const $post = $(element)
        const postNumber = index + 1
        const author = $post.find('.name').text().trim() || '名無しさん'
        const content = $post.find('.message').text().trim()
        const dateText = $post.find('.date').text().trim()

        if (content) {
          posts.push({
            id: `temp-${postNumber}`,
            thread_id: 'temp',
            post_number: postNumber,
            author,
            content: this.cleanPostContent(content),
            posted_at: this.parseDate(dateText),
            is_selected: false,
          })
        }
      })

      return posts
    } catch (error) {
      console.error(`Error scraping thread posts from ${threadUrl}:`, error)
      return []
    }
  }

  /**
   * レス内容をクリーンアップ
   */
  private cleanPostContent(content: string): string {
    return content
      .replace(/>/g, '&gt;')
      .replace(/</g, '&lt;')
      .replace(/\n\s*\n/g, '\n')
      .trim()
  }

  /**
   * 日付文字列をパース
   */
  private parseDate(dateText: string): string {
    // 5ch.scの日付形式に合わせて調整
    const now = new Date()
    
    // 簡易的な日付パース（実際の形式に合わせて調整が必要）
    if (dateText.includes('今日')) {
      return now.toISOString()
    } else if (dateText.includes('昨日')) {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      return yesterday.toISOString()
    }
    
    // デフォルトは現在時刻
    return now.toISOString()
  }

  /**
   * 待機関数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * デフォルト設定でスクレイパーを作成
 */
export function createDefaultScraper(): FiveChScraper {
  return new FiveChScraper({
    boards: ['livegalileo', 'news4vip'], // なんJ、VIP
    minPostCount: 100,
    maxThreads: 20,
  })
}