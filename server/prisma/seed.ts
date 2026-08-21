import { PrismaClient, PeriodStatus, PeriodType, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

function getOrGenerate(envVar: string, fallback: () => string): string {
  const val = process.env[envVar];
  if (val && val.trim() !== '') return val.trim();
  return fallback();
}

async function main() {
  // ─── Initial admin user ─────────────────────────────────────────────────────
  // Password: use SEED_ADMIN_PASSWORD env var (dev only), or generate random
  const adminPassword = getOrGenerate(
    'SEED_ADMIN_PASSWORD',
    () => randomBytes(16).toString('base64url'),
  );
  const adminHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: 'admin@iso30414.local' },
    update: { role: Role.ADMIN, isActive: true },
    create: {
      email: 'admin@iso30414.local',
      passwordHash: adminHash,
      fullName: 'ISO Configuration Admin',
      role: Role.ADMIN,
    },
  });

  if (process.env.NODE_ENV !== 'production') {
    console.info('─────────────────────────────────────────────────────');
    console.info('Seed: admin@iso30414.local / ' + adminPassword);
    console.info('Change this password after first login!');
    console.info('─────────────────────────────────────────────────────');
  }

  // ─── Reporting periods ───────────────────────────────────────────────────────
  for (const year of [2021, 2022, 2023, 2024, 2025, 2026]) {
    for (const periodType of [PeriodType.Annual, PeriodType.SemiAnnual, PeriodType.Quarterly]) {
      const label = `${year} ${periodType === PeriodType.SemiAnnual ? 'Semi-Annual' : periodType}`;
      const startDate = new Date(Date.UTC(year, 0, 1));
      const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59));
      await prisma.reportingPeriod.upsert({
        where: { year_periodType: { year, periodType } },
        update: { label, startDate, endDate },
        create: {
          year,
          periodType,
          label,
          startDate,
          endDate,
          status: year === 2026 ? PeriodStatus.Open : PeriodStatus.Closed,
        },
      });
    }
  }
}

main().finally(() => prisma.$disconnect());
