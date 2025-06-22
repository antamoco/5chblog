'use client'

import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">第1条（適用）</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                本利用規約（以下「本規約」）は、当サイト（以下「当サイト」）が提供するサービスの利用条件を定めるものです。利用者は、当サイトを利用することで、本規約に同意したものとみなします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">第2条（利用登録）</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトの利用に際して、利用者登録は必要ありません。ただし、コメント機能等を利用する場合は、必要な情報の提供をお願いする場合があります。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">第3条（禁止事項）</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                利用者は、当サイトの利用にあたり、以下の行為をしてはなりません：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>当サイトのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                <li>当サイトの運営を妨害するおそれのある行為</li>
                <li>他の利用者に関する個人情報等を収集または蓄積する行為</li>
                <li>不正アクセスをし、またはこれを試みる行為</li>
                <li>他の利用者に成りすます行為</li>
                <li>当サイトに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
                <li>その他、当サイトが不適切と判断する行為</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">第4条（コンテンツについて）</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトに掲載されているコンテンツ（文章、画像、動画等）の著作権は、当サイトまたは正当な権利者に帰属します。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトは、5ch.scの掲示板から公開されている投稿を引用・転載していますが、これらの投稿の著作権は各投稿者に帰属します。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                利用者は、当サイトのコンテンツを私的使用の範囲内で閲覧することができますが、無断での複製、転載、配布等はお控えください。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">第5条（当サイトの利用停止等）</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトは、利用者が以下のいずれかに該当する場合には、事前の通知なく、利用者に対して、当サイトの全部もしくは一部の利用を停止し、または利用者としての登録を抹消することができるものとします：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>本規約のいずれかの条項に違反した場合</li>
                <li>その他、当サイトが当サイトの利用を適当でないと判断した場合</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">第6条（保証の否認および免責事項）</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトは、当サイトに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます）がないことを明示的にも黙示的にも保証しておりません。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトは、当サイトに起因して利用者に生じたあらゆる損害について一切の責任を負いません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">第7条（サービス内容の変更等）</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトは、利用者に通知することなく、当サイトの内容を変更しまたは当サイトの提供を中止することができるものとし、これによって利用者に生じた損害について一切の責任を負いません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">第8条（利用規約の変更）</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトは、必要と判断した場合には、利用者に通知することなくいつでも本規約を変更することができるものとします。なお、本規約の変更後、当サイトの利用を開始した場合には、当該利用者は変更後の規約に同意したものとみなします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">第9条（個人情報の取扱い）</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトは、当サイトの利用によって取得する個人情報については、<Link href="/privacy-policy" className="text-blue-600 hover:underline">プライバシーポリシー</Link>に従い適切に取り扱うものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">第10条（通知または連絡）</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                利用者と当サイト運営者との間の通知または連絡は、当サイトの定める方法によって行うものとします。当サイトは、利用者から、当サイトが別途定める方式に従った変更届け出がない限り、現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い、これらは、発信時に利用者へ到達したものとみなします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">第11条（権利義務の譲渡の禁止）</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                利用者は、当サイトの書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">第12条（準拠法・裁判管轄）</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                本規約の解釈にあたっては、日本法を準拠法とします。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                当サイトに関して紛争が生じた場合には、当サイト運営者の所在地を管轄する裁判所を専属的合意管轄とします。
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