'use client'

import { useEffect, useState } from 'react'
import { imageFor, loadImages } from '@/lib/images'

/**
 * يعرض صورة حقيقية إن وُجدت للمفتاح، وإلا الإيموجي.
 * src يفرض رابطاً مباشراً (مثل الأعلام).
 */
export default function Pic({
  imageKey, emoji, src, size = 64, rounded = 'rounded-2xl', className = '', emojiClass = '',
}: { imageKey?: string; emoji: string; src?: string; size?: number; rounded?: string; className?: string; emojiClass?: string }) {
  const [url, setUrl] = useState<string | undefined>(src || (imageKey ? imageFor(imageKey) : undefined))
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (src) { setUrl(src); return }
    if (!imageKey) return
    setUrl(imageFor(imageKey))
    loadImages().then(m => setUrl(m[imageKey]))
  }, [imageKey, src])

  if (url && !failed) {
    return (
      <img
        src={url} alt="" width={size} height={size} loading="lazy" draggable={false}
        onError={() => setFailed(true)}
        className={`${rounded} object-cover bg-white/40 ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span className={`inline-flex items-center justify-center leading-none ${emojiClass} ${className}`} style={{ width: size, height: size, fontSize: size * 0.62 }}>
      {emoji}
    </span>
  )
}
