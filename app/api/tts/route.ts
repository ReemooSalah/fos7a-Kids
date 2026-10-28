import { NextResponse } from 'next/server'
import { ELEVEN_BASE, requireAdmin } from '@/lib/serverAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MAX_CHARS = 9000

/**
 * يولّد صوتاً من نص عبر ElevenLabs، يخزّنه في Supabase Storage، ويعيد الرابط.
 * للمشرف فقط. يُستدعى مرة واحدة لكل قصة، والملف الناتج يُحفظ ولا يُعاد توليده.
 */
export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 })

  const key = process.env.ELEVENLABS_API_KEY
  if (!key) return NextResponse.json({ error: 'ELEVENLABS_API_KEY غير مضاف في Vercel' }, { status: 500 })

  let body: { text?: string; voiceId?: string; contentId?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 }) }

  const text = (body.text || '').trim()
  const voiceId = (body.voiceId || '').trim()
  if (!text) return NextResponse.json({ error: 'النص فارغ' }, { status: 400 })
  if (!/^[A-Za-z0-9]{10,40}$/.test(voiceId)) return NextResponse.json({ error: 'معرّف الصوت غير صالح' }, { status: 400 })
  if (text.length > MAX_CHARS) return NextResponse.json({ error: `النص أطول من ${MAX_CHARS} حرفاً، قسّمه إلى أجزاء` }, { status: 400 })

  const r = await fetch(`${ELEVEN_BASE}/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true },
    }),
  })
  if (!r.ok) {
    const detail = (await r.text()).slice(0, 300)
    return NextResponse.json({ error: `ElevenLabs: ${r.status}`, detail }, { status: 502 })
  }

  const audio = Buffer.from(await r.arrayBuffer())
  const safeId = (body.contentId || 'x').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'x'
  const path = `tts/${safeId}-${voiceId.slice(0, 8)}-${Date.now()}.mp3`

  const { error } = await auth.admin.storage.from('audio').upload(path, audio, { contentType: 'audio/mpeg', upsert: false, cacheControl: '31536000' })
  if (error) return NextResponse.json({ error: `فشل الحفظ: ${error.message}` }, { status: 500 })

  const { data } = auth.admin.storage.from('audio').getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl, bytes: audio.length, chars: text.length })
}
