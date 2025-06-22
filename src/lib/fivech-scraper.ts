import axios from 'axios'
import * as cheerio from 'cheerio'
import * as iconv from 'iconv-lite'
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
      
      // 複数の板一覧ソースを試行
      const sources = [
        'https://menu.5ch.net/bbstable.html',
        'https://menu.2ch.sc/bbstable.html',
        'https://www.5ch.net/',
        'https://www.2ch.sc/'
      ]

      let boardMap = new Map<string, string>()

      for (const sourceUrl of sources) {
        try {
          console.log(`Trying board list source: ${sourceUrl}`)
          
          const response = await axios.get(sourceUrl, {
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            responseType: 'arraybuffer'
          })

          const html = iconv.decode(Buffer.from(response.data), 'shift_jis')
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

      // キャッシュに保存
      if (boardMap.size > 0) {
        this.boardListCache = boardMap
        this.boardListCacheTime = now
        console.log(`Cached board list with ${boardMap.size} boards`)
      }

      return boardMap
    } catch (error) {
      console.error('Failed to fetch board list from all sources:', error.message)
      
      // キャッシュがあれば古くても使用
      if (this.boardListCache) {
        console.log(`Using stale board list cache (${this.boardListCache.size} boards)`)
        return this.boardListCache
      }
      
      return new Map()
    }
  }

  /**
   * 板に対応する正しいサーバーURLを検出
   */
  private async detectServerForBoard(board: string): Promise<string> {
    // キャッシュから取得
    if (this.serverCache.has(board)) {
      return this.serverCache.get(board)!
    }

    console.log(`Detecting server for board: ${board}`)

    // まず板一覧から取得を試行
    const boardList = await this.fetchBoardList()
    const serverFromList = boardList.get(board)
    
    if (serverFromList) {
      console.log(`Found server from board list for ${board}: ${serverFromList}`)
      
      // 実際にアクセスして確認（リダイレクト追跡付き）
      const validServer = await this.testServerWithRedirect(serverFromList, board)
      if (validServer) {
        console.log(`Confirmed valid server for ${board}: ${validServer}`)
        this.serverCache.set(board, validServer)
        return validServer
      }
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
      const validServer = await this.testServerWithRedirect(server, board)
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
   * サーバーをテストし、リダイレクトがあれば追跡する
   */
  private async testServerWithRedirect(baseUrl: string, board: string, maxRedirects: number = 3): Promise<string | null> {
    let currentUrl = `${baseUrl}/${board}/`
    let redirectCount = 0

    while (redirectCount <= maxRedirects) {
      try {
        console.log(`Testing URL: ${currentUrl} (redirect ${redirectCount}/${maxRedirects})`)
        
        const response = await axios.get(currentUrl, {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
          responseType: 'arraybuffer',
          validateStatus: (status) => status < 500
        })

        if (response.status < 400) {
          const html = iconv.decode(Buffer.from(response.data), 'shift_jis')
          
          // リダイレクトがあるかチェック
          const redirectUrl = this.extractRedirectUrl(html)
          if (redirectUrl) {
            console.log(`Found redirect from ${currentUrl} to ${redirectUrl}`)
            currentUrl = redirectUrl
            redirectCount++
            continue
          }

          // 有効な板ページかチェック
          if (this.isValidBoardPage(html, board)) {
            // URLから正しいサーバーを抽出
            const url = new URL(currentUrl)
            const serverUrl = `${url.protocol}//${url.hostname}`
            console.log(`Valid server found: ${serverUrl}`)
            return serverUrl
          }
        }

        // リダイレクトもなく、有効でもない場合は失敗
        return null
      } catch (error) {
        console.log(`Error testing ${currentUrl}:`, error.message)
        return null
      }
    }

    console.log(`Too many redirects for board ${board}`)
    return null
  }

  /**
   * HTMLからリダイレクトURLを抽出
   */
  private extractRedirectUrl(html: string): string | null {
    // JavaScriptリダイレクトを検出
    const jsRedirectMatch = html.match(/window\.location\.href\s*=\s*["']([^"']+)["']/i)
    if (jsRedirectMatch) {
      let redirectUrl = jsRedirectMatch[1]
      // プロトコルが省略されている場合はHTTPSを追加
      if (redirectUrl.startsWith('//')) {
        redirectUrl = 'https:' + redirectUrl
      }
      return redirectUrl
    }

    // metaリフレッシュを検出
    const metaRefreshMatch = html.match(/<meta[^>]+http-equiv\s*=\s*["']refresh["'][^>]+content\s*=\s*["'][^;]*;\s*url\s*=\s*([^"']+)["']/i)
    if (metaRefreshMatch) {
      let redirectUrl = metaRefreshMatch[1]
      if (redirectUrl.startsWith('//')) {
        redirectUrl = 'https:' + redirectUrl
      }
      return redirectUrl
    }

    return null
  }

  /**
   * レスポンスが有効な板ページかどうかを判定
   */
  private isValidBoardPage(html: string, board: string): boolean {
    // リダイレクトが含まれている場合は無効
    const redirectUrl = this.extractRedirectUrl(html)
    if (redirectUrl) {
      console.log(`Found redirect to: ${redirectUrl} for board ${board}`)
      return false
    }

    // HTMLの長さが短すぎる場合は無効
    if (html.length < 1000) {
      console.log(`HTML too short (${html.length} chars) for board ${board}`)
      console.log(`HTML preview: ${html.substring(0, 200)}...`)
      return false
    }

    // エラーページの兆候をチェック（より詳細に、誤検知を避ける）
    const errorIndicators = [
      'そんな板orスレッドないです',
      '404 Not Found',
      'エラーが発生しました',
      'このスレッドは過去ログ倉庫に格納されています',
      'スレッド一覧はありません',
      '板が見つかりません',
      'このホストでは',
      'アクセスできません',
      'SETTING.TXT',
      '移転しました',
      'アクセス拒否',
      'access denied',
      'forbidden'
    ]

    const lowerHtml = html.toLowerCase()
    
    // 一般的なエラー指標をチェック
    for (const indicator of errorIndicators) {
      if (lowerHtml.includes(indicator.toLowerCase())) {
        console.log(`Found error indicator "${indicator}" for board ${board}`)
        console.log(`Context: ${this.extractContext(html, indicator)}`)
        return false
      }
    }

    // "Error"の誤検知を避けるため、JavaScript関数名やイベントハンドラーを除外
    if (lowerHtml.includes('error')) {
      // imgError, onerror, console.error などのJavaScript関数は除外
      const context = this.extractContext(html, 'error')
      const isJavaScriptError = /img.*error|onerror|console\.error|function.*error/i.test(context)
      
      if (!isJavaScriptError) {
        console.log(`Found error indicator "error" for board ${board}`)
        console.log(`Context: ${context}`)
        return false
      } else {
        console.log(`Ignoring JavaScript error function for board ${board}`)
      }
    }

    // 有効な板ページの兆候をチェック
    const validIndicators = [
      '/test/read.cgi/',
      'subject.txt',
      'dat',
      'スレッド',
      'thread',
      'レス',
      '<title>' + board,
      '掲示板',
      'BBS'
    ]

    let validCount = 0
    for (const indicator of validIndicators) {
      if (lowerHtml.includes(indicator.toLowerCase())) {
        validCount++
      }
    }

    if (validCount < 2) {
      console.log(`Not enough valid indicators (${validCount}/2) for board ${board}`)
      console.log(`HTML sample: ${html.substring(0, 500)}...`)
      return false
    }

    console.log(`Valid board page detected for ${board} (${validCount} indicators)`)
    
    // デバッグ用にHTMLの構造を少し表示
    const $ = cheerio.load(html)
    console.log(`Page title: ${$('title').text()}`)
    console.log(`Found ${$('a[href*="/test/read.cgi/"]').length} thread links`)
    
    return true
  }

  /**
   * エラー指標の周辺文脈を抽出
   */
  private extractContext(html: string, indicator: string): string {
    const index = html.toLowerCase().indexOf(indicator.toLowerCase())
    if (index === -1) return ''
    
    const start = Math.max(0, index - 50)
    const end = Math.min(html.length, index + indicator.length + 50)
    return html.substring(start, end).replace(/\s+/g, ' ')
  }

  /**
   * 指定された板からスレッド一覧を取得
   */
  async scrapeThreads(board: string): Promise<ScrapedThread[]> {
    try {
      console.log(`=== Starting scrape for board: ${board} ===`)
      const baseUrl = await this.detectServerForBoard(board)
      const boardUrl = `${baseUrl}/${board}/`
      console.log(`Fetching board URL: ${boardUrl}`)
      
      const response = await axios.get(boardUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        responseType: 'arraybuffer'
      })

      // Shift_JISをUTF-8に変換
      const html = iconv.decode(Buffer.from(response.data), 'shift_jis')

      console.log(`Response status: ${response.status}`)
      console.log(`Response data length: ${html.length}`)

      const $ = cheerio.load(html)
      const threads: ScrapedThread[] = []

      // 5ch.scの実際のセレクターパターン
      const selectors = [
        'a[href*="/test/read.cgi/"]', // 5ch特有のURL形式（最優先）
        'tr a', // テーブル行内のリンク
        'table tr a', // テーブル内のリンク
      ]

      let foundThreads = false

      for (const selector of selectors) {
        console.log(`Trying selector: ${selector}`)
        
        $(selector).each((index, element) => {
          if (index > 50) return false // 最初の50要素のみチェック
          
          const $element = $(element)
          let $link = $element.is('a') ? $element : $element.find('a')
          
          if ($link.length === 0) return
          
          const title = $link.text().trim()
          const href = $link.attr('href')
          
          if (title && href && title.length > 5) {
            console.log(`Found potential thread: ${title.substring(0, 50)}...`)
            
            // レス数を抽出（5ch.scの形式）
            const postCountPatterns = [
              /\((\d+)\)/, // (123) 形式
              /（(\d+)）/, // 全角括弧
              /レス数：(\d+)/, // レス数：123 形式
              /res:(\d+)/, // res:123 形式
              /\[(\d+)\]/, // [123] 形式
              /【(\d+)】/, // 【123】 形式
              /^\d+:\s.*\((\d+)\)$/, // "123: タイトル (456)" 形式
            ]
            
            let postCount = 0
            for (const pattern of postCountPatterns) {
              const match = title.match(pattern)
              if (match) {
                const extracted = parseInt(match[1])
                // 現実的なレス数かチェック（1-100000の範囲）
                if (extracted >= 1 && extracted <= 100000) {
                  postCount = extracted
                  break
                }
              }
            }
            
            // レス数が見つからない場合は親要素や兄弟要素から検索
            if (postCount === 0) {
              console.log(`No post count found in title: "${title}"`)
              
              // 親要素のテキストを確認
              const parentText = $element.parent().text()
              console.log(`Parent element text: "${parentText}"`)
              
              for (const pattern of postCountPatterns) {
                const match = parentText.match(pattern)
                if (match) {
                  const extracted = parseInt(match[1])
                  // 現実的なレス数かチェック（1-100000の範囲）
                  if (extracted >= 1 && extracted <= 100000) {
                    postCount = extracted
                    console.log(`Found post count in parent: ${postCount}`)
                    break
                  }
                }
              }
              
              // 兄弟要素も確認
              if (postCount === 0) {
                $element.siblings().each((_, sibling) => {
                  const siblingText = $(sibling).text()
                  for (const pattern of postCountPatterns) {
                    const match = siblingText.match(pattern)
                    if (match) {
                      const extracted = parseInt(match[1])
                      // 現実的なレス数かチェック（1-100000の範囲）
                      if (extracted >= 1 && extracted <= 100000) {
                        postCount = extracted
                        console.log(`Found post count in sibling: ${postCount}`)
                        return false // break out of loop
                      }
                    }
                  }
                })
              }
            }

            console.log(`Post count: ${postCount}, Min required: ${this.config.minPostCount}`)

            if (postCount >= this.config.minPostCount) {
              const cleanTitle = title.replace(/\((\d+)\)$/, '').replace(/（(\d+)）$/, '').replace(/\s*\(\d+\)$/, '').trim()
              
              // 無効なhrefをスキップ（アンカーリンクや短すぎるURLなど）
              if (!href || href.startsWith('#') || href.length < 5 || !href.includes('test/read.cgi')) {
                return
              }
              
              // ../test/read.cgi/... を完全URLに変換
              const fullUrl = href.startsWith('http') ? href : 
                              href.startsWith('../') ? `${baseUrl}/${href.replace('../', '')}` :
                              href.startsWith('/') ? `${baseUrl}${href}` :
                              `${baseUrl}/${href}`
              
              threads.push({
                title: cleanTitle,
                url: fullUrl,
                postCount,
                board,
              })
              
              foundThreads = true
              console.log(`Added thread: ${cleanTitle}`)
            }
          }
        })
        
        if (foundThreads) {
          console.log(`Found ${threads.length} threads with selector: ${selector}`)
          break
        }
      }

      console.log(`Total threads found: ${threads.length}`)
      console.log(`Threads with min post count (${this.config.minPostCount}): ${threads.filter(t => t.postCount >= this.config.minPostCount).length}`)

      const filteredThreads = threads
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, this.config.maxThreads)
      
      console.log(`=== Scraping completed for board: ${board}. Returning ${filteredThreads.length} threads ===`)
      return filteredThreads
    } catch (error) {
      console.error(`=== ERROR scraping board ${board}:`, error.message)
      if (error.response) {
        console.error(`Response status: ${error.response.status}`)
        console.error(`Response headers:`, error.response.headers)
      }
      return []
    }
  }

  /**
   * 全対象板からスレッドを収集
   */
  async collectThreads(): Promise<ScrapedThread[]> {
    console.log(`=== Starting thread collection ===`)
    console.log(`Target boards: ${this.config.boards.join(', ')}`)
    console.log(`Min post count: ${this.config.minPostCount}`)
    console.log(`Max threads per board: ${this.config.maxThreads}`)
    
    const allThreads: ScrapedThread[] = []

    for (const board of this.config.boards) {
      console.log(`\n--- Scraping board: ${board} ---`)
      const boardThreads = await this.scrapeThreads(board)
      console.log(`Board ${board} returned ${boardThreads.length} threads`)
      allThreads.push(...boardThreads)
      
      // レート制限を避けるため1秒待機
      await this.sleep(1000)
    }

    const finalThreads = allThreads
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, this.config.maxThreads * this.config.boards.length)
    
    console.log(`=== Thread collection completed ===`)
    console.log(`Total threads collected: ${allThreads.length}`)
    console.log(`Final threads after limit: ${finalThreads.length}`)
    
    return finalThreads
  }

  /**
   * 特定のスレッドから全レスを取得
   */
  async scrapeThreadPosts(threadUrl: string): Promise<Post[]> {
    try {
      const allPosts: Post[] = []
      
      // 複数のURL形式を試行して全レスを取得
      const urlsToTry = [
        threadUrl.replace('/l50', ''), // /l50を削除
        threadUrl.replace('/l50', '/1-1000'), // 1-1000レス
        threadUrl.replace('/l50', '/0-'), // 全レス（形式1）
        threadUrl // 元のURL（最後の50レス）
      ]
      
      for (const url of urlsToTry) {
        console.log(`Trying URL: ${url}`)
        
        try {
          const response = await axios.get(url, {
            timeout: 15000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            responseType: 'arraybuffer'
          })

          // Shift_JISをUTF-8に変換
          const html = iconv.decode(Buffer.from(response.data), 'shift_jis')
          console.log(`Response status: ${response.status}`)
          console.log(`HTML length: ${html.length}`)

          const $ = cheerio.load(html)
          const posts = this.extractPostsFromHtml($)
          
          if (posts.length > allPosts.length) {
            console.log(`Found ${posts.length} posts with URL: ${url}`)
            allPosts.splice(0, allPosts.length, ...posts) // 配列を置き換え
          }
          
          // 十分なレス数が取得できた場合は終了
          if (posts.length > 50) {
            break
          }
        } catch (error) {
          console.log(`Failed to fetch ${url}:`, error.message)
          continue
        }
      }

      return allPosts.sort((a, b) => a.post_number - b.post_number)
    } catch (error) {
      console.error(`Error scraping thread posts:`, error)
      return []
    }
  }

  /**
   * HTMLからレスを抽出する共通メソッド
   */
  private extractPostsFromHtml($: cheerio.CheerioAPI): Post[] {
    const posts: Post[] = []

    // 5ch.scの実際のレス構造に合わせて複数のセレクターを試行
    const selectors = [
      '.post', // 一般的な投稿
      'dd', // 5ch.scでよく使われる
      'dt + dd', // 投稿者情報の後の内容
      '.res', // レス
      'div[data-number]', // データ番号付きdiv
    ]

    let foundPosts = false

    for (const selector of selectors) {
      console.log(`Trying post selector: ${selector}`)
      
      $(selector).each((index, element) => {
        const $post = $(element)
        let postNumber = index + 1
        
        // レス番号を抽出を試行
        const numberFromData = $post.attr('data-number') || $post.find('[data-number]').attr('data-number')
        if (numberFromData) {
          postNumber = parseInt(numberFromData) || postNumber
        }

        // 投稿者を取得
        let author = $post.find('.name, .postusername, b, .metabox b').first().text().trim()
        if (!author) {
          // 隣接する要素から投稿者情報を探す
          const $prev = $post.prev()
          author = $prev.find('b').text().trim() || '名無しさん'
        }
        if (!author || author === '') author = '名無しさん'

        // 投稿IDを取得（デバッグ強化）
        let postId = ''
        
        // 要素全体のテキストからIDパターンを探す
        const elementText = $post.text()
        const elementHtml = $post.html()
        
        // IDパターンを検索
        const idSearchPatterns = [
          // 5ch.scの一般的なIDパターン
          /ID:([A-Za-z0-9+\/]{8,})/,  // ID:abcd1234 形式
          /ID：([A-Za-z0-9+\/]{8,})/, // 全角コロン
          /\s([A-Za-z0-9+\/]{8}[A-Za-z0-9+\/]*)\s/, // 8文字以上の英数字
        ]
        
        for (const pattern of idSearchPatterns) {
          const match = elementText.match(pattern)
          if (match) {
            postId = match[1]
            console.log(`Found ID with pattern ${pattern.source}: ${postId}`)
            break
          }
        }
        
        // 従来の方法も試行
        if (!postId) {
          const idPatterns = [
            $post.find('.uid, .postid, .id, .poster_id').text().trim(),
            $post.attr('data-id') || '',
            $post.find('[data-id]').attr('data-id') || '',
            $post.find('span').text().trim(), // span要素からID探索
          ]
          
          for (const pattern of idPatterns) {
            if (pattern && pattern.length > 5) { // 最低5文字以上
              postId = pattern
              console.log(`Found ID with selector: ${postId}`)
              break
            }
          }
        }
        
        // デバッグ情報出力（最初の数件のみ）
        if (index < 3) {
          console.log(`Post ${postNumber} debug:`)
          console.log(`- Text sample: ${elementText.substring(0, 200)}...`)
          console.log(`- Found ID: ${postId || 'None'}`)
        }

        // 投稿内容を取得
        let content = $post.find('.message, .postMessage').text().trim()
        if (!content) {
          // テキストコンテンツを直接取得
          content = $post.text().trim()
          // 投稿者名や日付部分を除去
          content = content.replace(new RegExp(`^.*${author}.*`, 'i'), '').trim()
        }

        // 日付を取得（より詳細に）
        let dateText = ''
        let fullDateTime = ''
        const dateSelectors = ['.date', '.postdate', '.metabox', 'span']
        
        for (const selector of dateSelectors) {
          const $dateElement = $post.find(selector)
          if ($dateElement.length > 0) {
            const text = $dateElement.text().trim()
            // 日付パターンを探す
            const datePatterns = [
              /(\d{4}\/\d{2}\/\d{2}.*\d{2}:\d{2}:\d{2})/,  // 2024/06/13 15:30:45
              /(\d{2}\/\d{2}\/\d{2}.*\d{2}:\d{2}:\d{2})/,  // 24/06/13 15:30:45
              /(\d{4}-\d{2}-\d{2}.*\d{2}:\d{2}:\d{2})/,    // 2024-06-13 15:30:45
              /(\d{2}\/\d{2}\/\d{2}.*\d{2}:\d{2})/,        // 24/06/13 15:30
              /(\d{4}\/\d{2}\/\d{2})/,                      // 2024/06/13
            ]
            
            for (const pattern of datePatterns) {
              const match = text.match(pattern)
              if (match) {
                fullDateTime = match[1]
                dateText = text
                break
              }
            }
            
            if (fullDateTime) break
          }
        }
        
        // 隣接要素からも日付とIDを探す
        if (!fullDateTime || !postId) {
          const $prev = $post.prev()
          const prevText = $prev.text().trim()
          
          // 日付を探す
          if (!fullDateTime) {
            const dateMatch = prevText.match(/(\d{4}\/\d{2}\/\d{2}.*\d{2}:\d{2}:\d{2})/)
            if (dateMatch) {
              fullDateTime = dateMatch[1]
              dateText = prevText
            }
          }
          
          // IDを探す（dt要素などに含まれることが多い）
          if (!postId) {
            const idMatch = prevText.match(/ID:([A-Za-z0-9+\/]{8,})/)
            if (idMatch) {
              postId = idMatch[1]
              console.log(`Found ID in adjacent element: ${postId}`)
            }
          }
        }

        if (content && content.length > 5) {
          console.log(`Found post ${postNumber}: ${content.substring(0, 50)}... (ID: ${postId || 'N/A'}, Date: ${fullDateTime || 'N/A'})`)
          
          posts.push({
            id: `temp-${postNumber}`,
            thread_id: 'temp',
            post_number: postNumber,
            author,
            content: this.cleanPostContent(content),
            posted_at: this.parseDate(fullDateTime || dateText),
            post_id: postId || '', // 投稿ID
            raw_date: fullDateTime || dateText || '', // 生の日付文字列
            is_selected: false,
          })
          foundPosts = true
        }
      })

      if (foundPosts && posts.length > 0) {
        console.log(`Found ${posts.length} posts with selector: ${selector}`)
        break
      }
    }

    // HTMLの構造を確認（デバッグ用）
    if (!foundPosts) {
      console.log('No posts found with any selector. HTML structure:')
      console.log($('body').children().map((i, el) => $(el).prop('tagName')).get().slice(0, 10))
      
      // よくあるパターンをテスト
      console.log('Testing common patterns:')
      console.log(`dd elements: ${$('dd').length}`)
      console.log(`div elements: ${$('div').length}`)
      console.log(`table tr: ${$('table tr').length}`)
    }

    return posts
  }

  /**
   * レス内容をクリーンアップ
   */
  private cleanPostContent(content: string): string {
    return content
      .replace(/&gt;&gt;/g, '>>')  // &gt;&gt;を>>に変換
      .replace(/&gt;/g, '>')     // &gt;を>に変換
      .replace(/&lt;/g, '<')     // &lt;を<に変換
      .replace(/&amp;/g, '&')    // &amp;を&に変換
      .replace(/^>/gm, '')       // 行頭の>を削除
      .replace(/^>>/gm, '')      // 行頭の>>を削除
      .replace(/\n\s*\n/g, '\n')
      .trim()
  }

  /**
   * 日付文字列をパース
   */
  private parseDate(dateText: string): string {
    if (!dateText) {
      return new Date().toISOString()
    }

    const now = new Date()
    
    // 様々な日付形式に対応
    const patterns = [
      // 2024/06/13 15:30:45.12 形式
      /(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2}):(\d{2})\.?(\d+)?/,
      // 24/06/13 15:30:45 形式
      /(\d{2})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/,
      // 2024-06-13 15:30:45 形式
      /(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/,
      // 24/06/13 15:30 形式
      /(\d{2})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/,
      // 2024/06/13 形式
      /(\d{4})\/(\d{2})\/(\d{2})/,
    ]

    for (const pattern of patterns) {
      const match = dateText.match(pattern)
      if (match) {
        try {
          let year, month, day, hour = 0, minute = 0, second = 0
          
          if (pattern.source.includes('\\d{4}')) {
            // 4桁年
            [, year, month, day, hour, minute, second] = match
          } else {
            // 2桁年
            [, year, month, day, hour, minute, second] = match
            year = parseInt(year) < 50 ? `20${year}` : `19${year}`
          }
          
          const date = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hour) || 0,
            parseInt(minute) || 0,
            parseInt(second) || 0
          )
          
          if (!isNaN(date.getTime())) {
            return date.toISOString()
          }
        } catch (error) {
          console.log(`Date parse error for "${dateText}":`, error)
        }
      }
    }

    // 相対的な日付表現
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
    minPostCount: 100, // 正しいデフォルト値
    maxThreads: 10,
  })
}

/**
 * 設定に基づいてスクレイパーを作成
 */
export function createScraperWithSettings(settings: {
  target_boards: string[]
  min_post_count: number
  maxThreads?: number
}): FiveChScraper {
  return new FiveChScraper({
    boards: settings.target_boards,
    minPostCount: settings.min_post_count,
    maxThreads: settings.maxThreads || 10,
  })
}