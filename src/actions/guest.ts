'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { syncRsvpToGoogleSheets } from '@/services/googleSheets'

export async function submitRsvp(token: string, status: string, numberOfGuests: number) {
  const guest = await prisma.guest.findUnique({ where: { token } })
  if (!guest) throw new Error("Guest not found")

  const rsvp = await prisma.rsvp.upsert({
    where: { guestId: guest.id },
    update: { status, numberOfGuests },
    create: { guestId: guest.id, status, numberOfGuests }
  })

  // Fire and forget webhook/sheets sync
  syncRsvpToGoogleSheets({
    guestId: guest.id,
    name: guest.name,
    token: guest.token,
    status: rsvp.status,
    numberOfGuests: rsvp.numberOfGuests
  }).catch(err => console.error("Sheets sync failed", err))

  revalidatePath(`/invitation/${token}`)
  return { success: true }
}

export async function submitWish(token: string, message: string) {
  const guest = await prisma.guest.findUnique({ where: { token } })
  if (!guest) throw new Error("Guest not found")

  await prisma.wish.create({
    data: { guestId: guest.id, message }
  })

  revalidatePath(`/invitation/${token}`)
  return { success: true }
}
