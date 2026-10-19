import { prisma } from '@/lib/prisma'
import SettingsForm from './SettingsForm'

export const dynamic = "force-dynamic"

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { secret?: string }
}) {
  const secret = searchParams.secret
  const backHref = secret
    ? `/admin?secret=${encodeURIComponent(secret)}`
    : '/admin'

  const settings = await prisma.eventSettings.findUnique({ where: { id: 'main' } })

  return (
    <div className="min-h-screen bg-stone-100 p-8 text-stone-800">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Pengaturan Undangan</h1>
          <a
            href={backHref}
            className="px-4 py-2 border border-dark-brown text-dark-brown text-sm rounded-md hover:bg-dark-brown hover:text-white transition"
          >
            Kembali
          </a>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
          <SettingsForm settings={settings} />
        </div>
      </div>
    </div>
  )
}