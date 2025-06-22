'use client'

import { useState } from 'react'
import { XMarkIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline'

interface ImageViewerProps {
  src: string
  alt: string
  className?: string
}

export function ImageViewer({ src, alt, className = '' }: ImageViewerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const openModal = () => {
    if (!hasError) {
      setIsModalOpen(true)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  // エラー時のフォールバック表示
  if (hasError) {
    return (
      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center space-x-2 text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm">画像を読み込めませんでした</span>
        </div>
        <a 
          href={src} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline text-sm mt-2 inline-block"
        >
          元の画像を開く
        </a>
      </div>
    )
  }

  return (
    <>
      {/* 通常表示の画像 */}
      <div className={`image-container relative group ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        <img
          src={src}
          alt={alt}
          className={`max-w-full h-auto rounded-lg shadow-md cursor-pointer transition-opacity ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } hover:shadow-lg`}
          onClick={openModal}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {/* ホバー時のオーバーレイ */}
        {!isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white bg-opacity-90 rounded-full p-2">
              <ArrowsPointingOutIcon className="w-5 h-5 text-gray-700" />
            </div>
          </div>
        )}
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          {/* モーダルコンテンツ */}
          <div className="relative max-w-full max-h-full">
            {/* 閉じるボタン */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            
            {/* 拡大画像 */}
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  )
}