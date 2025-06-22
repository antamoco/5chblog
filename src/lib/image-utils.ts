/**
 * 画像URL検出・処理ユーティリティ
 */

// 画像拡張子のパターン
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?[^\\s]*)?$/i

// 画像URLパターン（より幅広く対応）
const IMAGE_URL_PATTERNS = [
  // 直接的な画像URL
  /https?:\/\/[^\s<>"']+\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?[^\s<>"']*)?/gi,
  // imgur
  /https?:\/\/(i\.)?imgur\.com\/[a-zA-Z0-9]+(\.[a-zA-Z]{3,4})?/gi,
  // Twitter画像
  /https?:\/\/pbs\.twimg\.com\/media\/[^\s<>"']+/gi,
  // 5ch画像アップローダー
  /https?:\/\/img\.5ch\.net\/[^\s<>"']+/gi,
  // その他の画像ホスティングサービス
  /https?:\/\/(i\.)?redd\.it\/[^\s<>"']+/gi,
  /https?:\/\/cdn\.discordapp\.com\/attachments\/[^\s<>"']+/gi,
]

/**
 * テキストから画像URLを抽出
 */
export function extractImageUrls(text: string): string[] {
  const urls = new Set<string>()
  
  // 各パターンで検索
  IMAGE_URL_PATTERNS.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      matches.forEach(url => {
        // クリーンアップ
        const cleanUrl = cleanImageUrl(url)
        if (cleanUrl && isValidImageUrl(cleanUrl)) {
          urls.add(cleanUrl)
        }
      })
    }
  })
  
  return Array.from(urls)
}

/**
 * URLのクリーンアップ
 */
function cleanImageUrl(url: string): string {
  // 末尾の句読点や括弧を除去
  url = url.replace(/[.,;:!?)\]}>]+$/, '')
  
  // imgurの場合、拡張子がない場合は.jpgを追加
  if (url.includes('imgur.com') && !IMAGE_EXTENSIONS.test(url)) {
    url = url + '.jpg'
  }
  
  return url
}

/**
 * 有効な画像URLかチェック
 */
function isValidImageUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * テキスト内の画像URLを画像タグに置換
 */
export function replaceImageUrlsWithTags(text: string): string {
  const imageUrls = extractImageUrls(text)
  let processedText = text
  
  imageUrls.forEach(url => {
    // プロキシURL生成（CORS対策）
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`
    
    // 画像タグに置換（React componentを使用するためのマーカー付き）
    const imageTag = `<div class="image-container my-4" data-image-url="${url}" data-proxy-url="${proxyUrl}">
      <img 
        src="${proxyUrl}" 
        alt="投稿画像" 
        class="max-w-full h-auto rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
        onclick="this.parentElement.classList.add('modal-open')"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='block'"
        loading="lazy"
      />
      <div style="display:none" class="text-sm text-gray-500 p-2 border rounded bg-gray-50">
        <span class="flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span>画像を読み込めませんでした</span>
        </span>
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline block mt-1">
          元の画像を開く
        </a>
      </div>
    </div>`
    
    // URLを画像タグに置換（最初の出現のみ）
    processedText = processedText.replace(url, imageTag)
  })
  
  return processedText
}

/**
 * 5ch投稿内容の画像URL処理
 */
export function processPostImages(content: string): string {
  return replaceImageUrlsWithTags(content)
}

/**
 * 画像URLの種類を判定
 */
export function getImageUrlType(url: string): string {
  if (url.includes('imgur.com')) return 'imgur'
  if (url.includes('pbs.twimg.com')) return 'twitter'
  if (url.includes('img.5ch.net')) return '5ch'
  if (url.includes('i.redd.it')) return 'reddit'
  if (url.includes('discordapp.com')) return 'discord'
  return 'other'
}

/**
 * 画像URLが読み込み可能かテスト
 */
export async function testImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}&test=true`, {
      method: 'HEAD'
    })
    return response.ok
  } catch {
    return false
  }
}