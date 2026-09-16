const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.eventSettings.findUnique({ where: { id: 'main' } })
  if (existing) {
    console.log('Settings already exist, skipping.')
    return
  }
  await prisma.eventSettings.create({
    data: { id: 'main' }
  })
  console.log('Default settings created.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())