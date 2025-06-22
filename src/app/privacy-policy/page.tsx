'use client'

import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. 基本方針</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイト（以下「当サイト」）は、利用者の個人情報保護を重要視し、個人情報の保護に関する法律、その他関係法令を遵守して、利用者の個人情報を取り扱います。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. 個人情報の収集について</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトでは、以下の場合に個人情報を収集することがあります：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>お問い合わせフォームからのご連絡時</li>
                <li>コメント投稿時（任意）</li>
                <li>ニュースレター登録時（該当する場合）</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Cookie（クッキー）について</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトでは、利用者の利便性向上のためCookieを使用します。Cookieとは、ウェブサイトが利用者のコンピュータに保存する小さなファイルです。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Cookieは以下の目的で使用されます：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>サイトの利用状況の分析</li>
                <li>広告の配信</li>
                <li>利用者の設定の保存</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Google AdSenseについて</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトでは、Google社の広告配信サービス「Google AdSense」を利用しています。Google AdSenseは、利用者の興味に応じた広告を表示するため、Cookie（クッキー）を使用します。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Google AdSenseに関する詳細は、<a href="https://policies.google.com/technologies/ads" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Googleの広告ポリシー</a>をご確認ください。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                パーソナライズ広告を無効にする場合は、<a href="https://adssettings.google.com/authenticated" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Googleの広告設定ページ</a>から設定を変更できます。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Google Analyticsについて</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトでは、サイトの利用状況を分析するため、Google社のアクセス解析ツール「Google Analytics」を使用しています。Google Analyticsは、トラフィックデータの収集のためにCookieを使用します。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                収集されるデータは匿名で収集されており、個人を特定するものではありません。この機能はCookieを無効にすることで収集を拒否することができます。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Google Analyticsについて詳しくは、<a href="https://marketingplatform.google.com/about/analytics/terms/jp/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Analyticsサービス利用規約</a>をご確認ください。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. 5ch.scコンテンツの利用について</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトは、5ch.scの掲示板から公開されているコンテンツを引用・転載しています。これらのコンテンツの著作権は各投稿者に帰属します。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                転載に関してご不明な点やご要望がある場合は、お問い合わせフォームよりご連絡ください。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. 個人情報の第三者提供について</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトは、以下の場合を除いて、個人情報を第三者に提供することはありません：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要がある場合</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
                <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. 個人情報の開示・訂正・削除について</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                利用者は、当サイトが保有する自己の個人情報について、開示・訂正・削除を求めることができます。お問い合わせフォームよりご連絡ください。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. 削除依頼について</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトに掲載されている内容について、削除をご希望の場合は、以下の情報を明記の上、お問い合わせフォームよりご連絡ください：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>該当する記事のURL</li>
                <li>削除を希望する理由</li>
                <li>削除を希望する箇所（具体的に）</li>
                <li>ご連絡先（確認のため）</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. 免責事項</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトは、掲載されている情報の正確性について可能な限り努力していますが、その正確性や安全性を保証するものではありません。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますので、ご了承ください。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. プライバシーポリシーの変更について</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトは、必要に応じて、このプライバシーポリシーの内容を変更することがあります。この場合、変更後のプライバシーポリシーの施行時期と内容を適切な方法により周知または通知します。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. お問い合わせ</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                本ポリシーに関するお問い合わせは、<Link href="/contact" className="text-blue-600 hover:underline">お問い合わせフォーム</Link>よりご連絡ください。
              </p>
            </section>

            <section className="mb-8">
              <p className="text-gray-600 text-sm">
                制定日：2024年6月21日<br />
                最終更新日：2024年6月21日
              </p>
            </section>
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