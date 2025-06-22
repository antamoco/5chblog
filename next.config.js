/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.5ch.net', 'i.imgur.com', 'pbs.twimg.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Cloudflare Pages対応: 画像最適化を無効化
    unoptimized: process.env.NODE_ENV === 'production',
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig