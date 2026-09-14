'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

function generateToken() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export async function addGuest(name: string) {
  const token = generateToken()
  await prisma.guest.create({
    data: { 
      name, 
      token,
      rsvp: {
        create: { status: 'pending', numberOfGuests: 0 }
      }
    }
  })
  revalidatePath('/admin')
}

export async function deleteGuest(id: string) {
  await prisma.guest.delete({ where: { id } })
  revalidatePath('/admin')
}

export async function resetRsvp(id: string) {
  await prisma.rsvp.update({
    where: { guestId: id },
    data: { status: 'pending', numberOfGuests: 0 }
  })
  revalidatePath('/admin')
}
