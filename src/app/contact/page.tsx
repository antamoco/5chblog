'use client'

import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general' // general, delete_request, copyright
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // ここで実際の送信処理を実装
      // 現在はダミー処理
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('お問い合わせを送信しました。確認次第ご回答いたします。')
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general'
      })
    } catch (error) {
      toast.error('送信に失敗しました。時間をおいて再度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">お問い合わせ</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* お問い合わせフォーム */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    お問い合わせの種類
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="general">一般的なお問い合わせ</option>
                    <option value="delete_request">削除依頼</option>
                    <option value="copyright">著作権に関するお問い合わせ</option>
                    <option value="technical">技術的な問題</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    件名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    メッセージ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="お問い合わせ内容を詳しくお書きください"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '送信中...' : '送信する'}
                </button>
              </form>
            </div>

            {/* 情報欄 */}
            <div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">お問い合わせについて</h2>
                
                <div className="space-y-4 text-sm text-gray-700">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">削除依頼の場合</h3>
                    <p className="mb-2">以下の情報を必ずご記載ください：</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>削除を希望する記事のURL</li>
                      <li>削除を希望する理由</li>
                      <li>削除を希望する箇所（具体的に）</li>
                      <li>ご本人確認のための情報</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">著作権について</h3>
                    <p className="text-xs">
                      当サイトは5ch.scの公開投稿を引用・転載しています。著作権に関するご指摘がございましたら、具体的な内容をお知らせください。
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">返信について</h3>
                    <p className="text-xs">
                      お問い合わせいただいた内容は、通常1〜3営業日以内にご返信いたします。お急ぎの場合はその旨をメッセージにご記載ください。
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">プライバシー</h3>
                    <p className="text-xs">
                      お問い合わせフォームで送信された情報は、お問い合わせ対応以外の目的では使用いたしません。詳しくは<Link href="/privacy-policy" className="text-blue-600 hover:underline">プライバシーポリシー</Link>をご確認ください。
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">よくある質問</h3>
                <div className="space-y-2 text-xs text-blue-800">
                  <div>
                    <strong>Q: 記事の転載許可は必要ですか？</strong><br />
                    A: 5ch.scの公開投稿は転載可能ですが、気になる点があればお問い合わせください。
                  </div>
                  <div>
                    <strong>Q: 広告に関するお問い合わせ</strong><br />
                    A: 広告掲載に関するご相談もお気軽にお問い合わせください。
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link href="/" className="text-blue-600 hover:underline">
              ← トップページに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}