import { NextResponse } from 'next/server'
import { ELEVEN_BASE, requireAdmin } from '@/lib/serverAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** قائمة أصوات ElevenLabs المتاحة في حسابك (للمشرف فقط) */
export async function GET(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 })

  const key = process.env.ELEVENLABS_API_KEY
  if (!key) return NextResponse.json({ error: 'ELEVENLABS_API_KEY غير مضاف في Vercel' }, { status: 500 })

  const r = await fetch(`${ELEVEN_BASE}/v1/voices`, { headers: { 'xi-api-key': key }, cache: 'no-store' })
  if (!r.ok) {
    const detail = (await r.text()).slice(0, 300)
    return NextResponse.json({ error: `ElevenLabs: ${r.status}`, detail }, { status: 502 })
  }
  const json = (await r.json()) as { voices?: { voice_id: string; name: string; category?: string; labels?: Record<string, string>; preview_url?: string }[] }
  const voices = (json.voices || []).map(v => ({
    id: v.voice_id, name: v.name, category: v.category || '',
    meta: [v.labels?.gender, v.labels?.accent, v.labels?.age].filter(Boolean).join(' · '),
    preview: v.preview_url || '',
  }))
  return NextResponse.json({ voices })
}
