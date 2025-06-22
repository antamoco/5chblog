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
  private readonly config: ScrapingConfig
  private serverCache: Map<string, string> = new Map()
  private boardListCache: Map<string, string> | null = null
  private boardListCacheTime: number = 0
  private readonly BOARD_LIST_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24時間

  constructor(config: ScrapingConfig) {
    this.config = config
  }

  /**
   * 5ch.scの板一覧から板情報を取得（キャッシュ付き）
   * Edge Runtime対応でfetch APIを使用
   */
  private async fetchBoardList(): Promise<Map<string, string>> {
    // キャッシュが有効な場合はそれを返す
    const now = Date.now()
    if (this.boardListCache && (now - this.boardListCacheTime) < this.BOARD_LIST_CACHE_DURATION) {
      console.log(`Using cached board list (${this.boardListCache.size} boards)`)
      return this.boardListCache
    }

    try {
      console.log('Fetching fresh board list from 5ch.sc...')
      
      // 複数の板一覧ソースを試行（UTF-8対応サイトを優先）
      const sources = [
        'https://www.5ch.net/',  // UTF-8対応
        'https://www.2ch.sc/',   // UTF-8対応
        'https://menu.5ch.net/bbstable.html',
        'https://menu.2ch.sc/bbstable.html'
      ]

      let boardMap = new Map<string, string>()

      for (const sourceUrl of sources) {
        try {
          console.log(`Trying board list source: ${sourceUrl}`)
          
          const response = await fetch(sourceUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            }
          })

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }

          const html = await response.text()
          const $ = cheerio.load(html)

          // 板一覧からURLを抽出
          $('a[href*="://"]').each((_, element) => {
            const href = $(element).attr('href')
            if (href && href.includes('.2ch.sc/') && href.includes('/')) {
              try {
                const url = new URL(href)
                const pathParts = url.pathname.split('/').filter(p => p)
                
                if (pathParts.length > 0) {
                  const boardName = pathParts[0]
                  // HTTPSを強制使用
                  const serverUrl = `https://${url.hostname}`
                  
                  if (boardName && !boardMap.has(boardName)) {
                    boardMap.set(boardName, serverUrl)
                  }
                }
              } catch (error) {
                // 無効なURLはスキップ
              }
            }
          })

          if (boardMap.size > 0) {
            console.log(`Successfully loaded ${boardMap.size} boards from ${sourceUrl}`)
            break
          }
        } catch (error) {
          console.log(`Failed to fetch from ${sourceUrl}:`, error instanceof Error ? error.message : String(error))
          continue
        }
      }

      if (boardMap.size === 0) {
        console.log('Failed to fetch board list from all sources, using fallback boards')
        // フォールバック用のデフォルト板
        boardMap.set('livegalileo', 'https://tomcat.2ch.sc')
        boardMap.set('news4vip', 'https://viper.2ch.sc')
        boardMap.set('newsplus', 'https://egg.2ch.sc')
      }

      this.boardListCache = boardMap
      this.boardListCacheTime = now
      
      console.log(`Board list cached with ${boardMap.size} boards`)
      return boardMap

    } catch (error) {
      console.error('Failed to fetch board list from all sources:', error instanceof Error ? error.message : String(error))
      
      // 完全にフォールバック
      const fallbackMap = new Map<string, string>()
      fallbackMap.set('livegalileo', 'https://tomcat.2ch.sc')
      fallbackMap.set('news4vip', 'https://viper.2ch.sc')
      
      this.boardListCache = fallbackMap
      this.boardListCacheTime = now
      
      return fallbackMap
    }
  }

  /**
   * 指定された板のサーバーURLを取得
   */
  private async getServerForBoard(board: string): Promise<string> {
    // キャッシュから確認
    if (this.serverCache.has(board)) {
      return this.serverCache.get(board)!
    }

    // 板一覧から検索
    const boardList = await this.fetchBoardList()
    const serverUrl = boardList.get(board)
    
    if (serverUrl) {
      console.log(`Found server for ${board}: ${serverUrl}`)
      this.serverCache.set(board, serverUrl)
      return serverUrl
    }

    // 板一覧からの取得に失敗した場合は、フォールバック用の一般的なサーバーを試行
    const fallbackServers = [
      'https://tomcat.2ch.sc',
      'https://viper.2ch.sc',
      'https://egg.2ch.sc',
      'https://hayabusa9.2ch.sc'
    ]

    console.log(`Board list lookup failed, trying fallback servers for ${board}`)
    
    for (const server of fallbackServers) {
      console.log(`Testing fallback server: ${server}`)
      const validServer = await this.testServer(server, board)
      if (validServer) {
        console.log(`Found valid fallback server for ${board}: ${validServer}`)
        this.serverCache.set(board, validServer)
        return validServer
      }
    }

    // どのサーバーも見つからない場合はデフォルトを使用
    console.log(`No valid server found for ${board}, using default: tomcat.2ch.sc`)
    const defaultUrl = 'https://tomcat.2ch.sc'
    this.serverCache.set(board, defaultUrl)
    return defaultUrl
  }

  /**
   * サーバーをテストする（Edge Runtime対応版）
   */
  private async testServer(baseUrl: string, board: string): Promise<string | null> {
    try {
      const testUrl = `${baseUrl}/${board}/`
      console.log(`Testing server: ${testUrl}`)
      
      const response = await fetch(testUrl, {
        method: 'HEAD', // HEADリクエストで軽量化
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
      })

      if (response.ok) {
        console.log(`Valid server found: ${baseUrl}`)
        return baseUrl
      }
      
      return null
    } catch (error) {
      console.log(`Error testing ${baseUrl}:`, error instanceof Error ? error.message : String(error))
      return null
    }
  }

  /**
   * スレッド一覧を収集
   */
  async collectThreads(): Promise<ScrapedThread[]> {
    const allThreads: ScrapedThread[] = []

    for (const board of this.config.boards) {
      try {
        console.log(`Collecting threads from board: ${board}`)
        const serverUrl = await this.getServerForBoard(board)
        const boardThreads = await this.collectThreadsFromBoard(serverUrl, board)
        allThreads.push(...boardThreads)
        
        if (allThreads.length >= this.config.maxThreads) {
          break
        }
      } catch (error) {
        console.error(`Failed to collect from board ${board}:`, error instanceof Error ? error.message : String(error))
        continue
      }
    }

    return allThreads.slice(0, this.config.maxThreads)
  }

  /**
   * 特定の板からスレッド一覧を取得
   */
  private async collectThreadsFromBoard(serverUrl: string, board: string): Promise<ScrapedThread[]> {
    try {
      const boardUrl = `${serverUrl}/${board}/`
      console.log(`Fetching threads from: ${boardUrl}`)
      
      const response = await fetch(boardUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)
      const threads: ScrapedThread[] = []

      // スレッド一覧からリンクを抽出
      $('a').each((_, element) => {
        const href = $(element).attr('href')
        const text = $(element).text().trim()

        if (href && text && href.match(/\d+/)) {
          const threadId = href.match(/(\d+)/)?.[1]
          if (threadId) {
            // レス数を抽出（例: "タイトル (123)" -> 123）
            const postCountMatch = text.match(/\((\d+)\)/)
            const postCount = postCountMatch ? parseInt(postCountMatch[1]) : 1

            if (postCount >= this.config.minPostCount) {
              const threadUrl = href.startsWith('http') ? href : `${serverUrl}/${board}/${href}`
              
              threads.push({
                title: text.replace(/\(\d+\)$/, '').trim(),
                url: threadUrl,
                postCount,
                board
              })
            }
          }
        }
      })

      console.log(`Found ${threads.length} threads from ${board}`)
      return threads.slice(0, 10) // 板ごとに最大10スレッド

    } catch (error) {
      console.error(`Error collecting threads from ${board}:`, error instanceof Error ? error.message : String(error))
      return []
    }
  }

  /**
   * スレッドからレスを取得
   */
  async scrapeThreadPosts(threadUrl: string): Promise<Post[]> {
    try {
      console.log(`Scraping posts from: ${threadUrl}`)
      
      const response = await fetch(threadUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)
      const posts: Post[] = []

      // レスを抽出（一般的な5chのHTML構造に対応）
      $('.post, .res, dt, dd').each((index, element) => {
        const $el = $(element)
        const text = $el.text().trim()
        
        if (text && text.length > 10) {
          // 簡易的なレス番号とコンテンツの抽出
          const postNumber = index + 1
          const author = 'Anonymous'
          const content = text.substring(0, 1000) // 長すぎるコンテンツは切り詰め

          posts.push({
            id: `${threadUrl}-${postNumber}`,
            thread_id: '',
            post_number: postNumber,
            author,
            content,
            posted_at: new Date().toISOString(),
            is_selected: false,
            display_order: null,
            style_config: {}
          })
        }
      })

      console.log(`Scraped ${posts.length} posts from thread`)
      return posts.slice(0, 100) // 最大100レス

    } catch (error) {
      console.error(`Error scraping thread posts:`, error instanceof Error ? error.message : String(error))
      return []
    }
  }
}

// ファクトリー関数
export function createDefaultScraper(): FiveChScraper {
  return new FiveChScraper({
    boards: ['livegalileo', 'news4vip'],
    minPostCount: 100,
    maxThreads: 50
  })
}

export function createScraperWithSettings(settings: {
  target_boards: string[]
  min_post_count: number
}): FiveChScraper {
  return new FiveChScraper({
    boards: settings.target_boards,
    minPostCount: settings.min_post_count,
    maxThreads: 50
  })
}