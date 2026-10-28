'use client'

import { getColorFromGradient, type ContentItem } from '@/lib/data'

/** غلاف محتوى: صورة حقيقية إن وُجدت وإلا الإيموجي على خلفية ملونة */
export default function Cover({ item, size = 56, className = '' }: { item: Pick<ContentItem, 'emoji' | 'coverColor' | 'imageUrl'>; size?: number; className?: string }) {
  return (
    <div className={`flex items-center justify-center overflow-hidden ${className}`} style={{ width: size, height: size, background: getColorFromGradient(item.coverColor), fontSize: size * 0.55 }}>
      {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" /> : item.emoji}
    </div>
  )
}
