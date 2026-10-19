'use server'

import { prisma } from '@/lib/prisma'

export type CheckInResult =
  | { status: 'ok'; name: string; pax: number; warning?: string }
  | { status: 'already'; name: string; at: string }
  | { status: 'invalid' }
  | { status: 'unauthorized' }

export async function checkInGuest(
  rawToken: string,
  secret: string
): Promise<CheckInResult> {
  // Same secret you use for the admin pages
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return { status: 'unauthorized' }
  }

  const token = rawToken.trim()
  if (!token) return { status: 'invalid' }

  const guest = await prisma.guest.findUnique({
    where: { token },
    include: { rsvp: true },
  })
  if (!guest) return { status: 'invalid' }

  // Only marks the guest if not already checked in (safe against double scans)
  const updated = await prisma.guest.updateMany({
    where: { token, checkedInAt: null },
    data: { checkedInAt: new Date() },
  })

  if (updated.count === 0) {
    return {
      status: 'already',
      name: guest.name,
      at: (guest.checkedInAt ?? new Date()).toISOString(),
    }
  }

  return {
    status: 'ok',
    name: guest.name,
    pax: guest.rsvp?.numberOfGuests || 1,
    warning:
      guest.rsvp?.status === 'attending'
        ? undefined
        : 'RSVP tamu ini belum dikonfirmasi hadir.',
  }
}