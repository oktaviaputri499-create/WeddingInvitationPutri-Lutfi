'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function setGuestPhone(guestId: string, phone: string) {
  await prisma.guest.update({
    where: { id: guestId },
    data: { phone: phone.trim() || null },
  })
  revalidatePath('/admin')
}