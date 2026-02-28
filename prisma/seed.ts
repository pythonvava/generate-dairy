import { PrismaClient, Position } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  // 本番環境への誤適用を防ぐガード
  if (process.env.NODE_ENV === 'production') {
    console.error('ERROR: Seed script must not run in production.')
    process.exit(1)
  }

  console.log('Seeding database...')

  const hashedPassword = await bcrypt.hash('Test1234', 10)

  // 営業担当者（テストケースが ID を前提とするため id を明示指定）
  await prisma.salesPerson.upsert({
    where: { email: 'yamada@example.co.jp' },
    update: {},
    create: {
      id: 1,
      name: '山田太郎',
      department: '営業1課',
      position: Position.SHUNIN,
      email: 'yamada@example.co.jp',
      password: hashedPassword,
      isActive: true,
    },
  })

  await prisma.salesPerson.upsert({
    where: { email: 'sato@example.co.jp' },
    update: {},
    create: {
      id: 2,
      name: '佐藤花子',
      department: '営業2課',
      position: Position.TANTO,
      email: 'sato@example.co.jp',
      password: hashedPassword,
      isActive: true,
    },
  })

  await prisma.salesPerson.upsert({
    where: { email: 'suzuki@example.co.jp' },
    update: {},
    create: {
      id: 3,
      name: '鈴木課長',
      department: '営業1課',
      position: Position.KACHOU,
      email: 'suzuki@example.co.jp',
      password: hashedPassword,
      isActive: true,
    },
  })

  // 無効ユーザー（is_active = false でログイン不可）
  await prisma.salesPerson.upsert({
    where: { email: 'invalid@example.co.jp' },
    update: {},
    create: {
      id: 4,
      name: '無効ユーザー',
      department: '営業1課',
      position: Position.TANTO,
      email: 'invalid@example.co.jp',
      password: hashedPassword,
      isActive: false,
    },
  })

  // シーケンスを最大IDに合わせてリセット（PostgreSQL）
  // autoincrement が4以降から採番されるよう調整する
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('sales_persons', 'id'), GREATEST((SELECT MAX(id) FROM sales_persons), 1))`
  )

  // 顧客（ID 固定指定）
  await prisma.customer.upsert({
    where: { id: 10 },
    update: {},
    create: {
      id: 10,
      name: '株式会社ABC',
      address: '東京都千代田区丸の内1-1-1',
      phone: '03-1234-5678',
      contactPerson: '田中一郎',
      isActive: true,
    },
  })

  await prisma.customer.upsert({
    where: { id: 20 },
    update: {},
    create: {
      id: 20,
      name: '株式会社XYZ',
      address: '大阪府大阪市北区梅田1-1-1',
      phone: '06-9876-5432',
      contactPerson: '高橋次郎',
      isActive: true,
    },
  })

  await prisma.customer.upsert({
    where: { id: 30 },
    update: {},
    create: {
      id: 30,
      name: '有限会社テスト',
      address: '神奈川県横浜市西区1-1-1',
      phone: '045-111-2222',
      contactPerson: '山本三郎',
      isActive: false,
    },
  })

  // customers シーケンスも同様にリセット
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('customers', 'id'), GREATEST((SELECT MAX(id) FROM customers), 1))`
  )

  // サンプル日報（山田太郎の当日分）
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const report = await prisma.dailyReport.upsert({
    where: {
      salesPersonId_reportDate: {
        salesPersonId: 1,
        reportDate: today,
      },
    },
    update: {},
    create: {
      salesPersonId: 1,
      reportDate: today,
      problem: 'ABC社への見積もり金額について相談したい。',
      plan: 'ABC社向け見積書作成、XYZ社へ対応報告メール送付。',
      visitRecords: {
        create: [
          {
            customerId: 10,
            visitContent: '新製品の提案を実施。次回見積もり提出予定。',
            sortOrder: 1,
          },
        ],
      },
    },
  })

  // サンプルコメント（鈴木課長から）
  await prisma.comment.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      dailyReportId: report.id,
      commenterId: 3,
      body: 'ABC社の見積もりは明日の朝会で一緒に確認しよう。',
    },
  })

  // comments シーケンスをリセット
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('comments', 'id'), GREATEST((SELECT MAX(id) FROM comments), 1))`
  )

  console.log('Seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
