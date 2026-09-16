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
}) {
  await prisma.eventSettings.update({
    where: { id: 'main' },
    data,
  })

  revalidatePath('/admin/settings')
  revalidatePath('/invitation/[token]', 'page')
}