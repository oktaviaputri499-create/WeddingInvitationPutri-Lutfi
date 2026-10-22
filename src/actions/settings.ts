'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateSettings(data: {
  groomName: string
  groomParents: string
  brideName: string
  brideParents: string
  weddingDate: string
  weddingTime: string
  weddingLocation: string
  welcomeMessage: string
  giftMessage: string
  bank1Name: string
  bank1Number: string
  bank1Holder: string
  bank2Name: string
  bank2Number: string
  bank2Holder: string
  texts: Record<string, string>
}) {
  const { texts, ...rest } = data

  // Keep only the texts that were actually filled in; empty ones fall back to the default
  const cleaned: Record<string, string> = {}
  for (const [k, v] of Object.entries(texts || {})) {
    if (typeof v === 'string' && v.trim()) cleaned[k] = v.trim()
  }

  await prisma.eventSettings.update({
    where: { id: 'main' },
    data: { ...rest, texts: JSON.stringify(cleaned) },
  })

  revalidatePath('/admin/settings')
  revalidatePath('/invitation/[token]', 'page')
}