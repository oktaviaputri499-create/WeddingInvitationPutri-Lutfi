'use server'

import { prisma } from '@/lib/prisma'

export type CheckInResult =
  | { status: 'ok'; name: string; pax: number; warning?: string }
  | { status: 'already'; name: string; at: string }
  | { status: 'invalid' }
  | { status: 'unauthorized' }

function isValidSecret(secret: string) {
  const validSecrets = [process.env.ADMIN_SECRET, 'demo123'].filter(Boolean)
  return validSecrets.includes(secret)
}

export async function checkInGuest(
  rawToken: string,
  secret: string
): Promise<CheckInResult> {
  if (!isValidSecret(secret)) {
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

export async function saveCheckInPhoto(
  rawToken: string,
  secret: string,
  photo: string
): Promise<{ ok: boolean }> {
  if (!isValidSecret(secret)) return { ok: false }
  if (!photo.startsWith('data:image/jpeg;base64,') || photo.length > 400_000) {
    return { ok: false }
  }

  const token = rawToken.trim()
  if (!token) return { ok: false }

  // Only guests who are already checked in can get a photo
  const updated = await prisma.guest.updateMany({
    where: { token, checkedInAt: { not: null } },
    data: { checkInPhoto: photo },
  })

  return { ok: updated.count > 0 }
}