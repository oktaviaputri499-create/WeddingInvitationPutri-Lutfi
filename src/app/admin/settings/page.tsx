import { prisma } from '@/lib/prisma'
import SettingsForm from './SettingsForm'

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const settings = await prisma.eventSettings.findUnique({ where: { id: 'main' } })

  return (
    <div className="min-h-screen bg-stone-100 p-8 text-stone-800">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Pengaturan Undangan</h1>
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
          <SettingsForm settings={settings} />
        </div>
      </div>
    </div>
  )
}