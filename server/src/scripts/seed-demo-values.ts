import { PrismaClient, ValueStatus, PeriodType } from '@prisma/client';

const prisma = new PrismaClient();

function generateValueForAttribute(attrName: string, dataType: string, exampleValue: string | null) {
  const nameLower = attrName.toLowerCase();

  if (dataType === 'Number' || dataType === 'Integer' || dataType === 'Decimal') {
    if (nameLower.includes('total') || nameLower.includes('jumlah')) {
      if (nameLower.includes('karyawan') || nameLower.includes('pegawai') || nameLower.includes('workforce')) return 4850;
      if (nameLower.includes('biaya') || nameLower.includes('cost') || nameLower.includes('investasi')) return 2500000000;
      if (nameLower.includes('jam')) return 320;
      return 150;
    }
    if (nameLower.includes('gaji') || nameLower.includes('upah') || nameLower.includes('remunerasi')) return 12500000;
    return 85;
  }

  if (dataType === 'Percentage') {
    if (nameLower.includes('turnover') || nameLower.includes('absenteeism')) return 3.2;
    if (nameLower.includes('retensi') || nameLower.includes('kesiapan') || nameLower.includes('kepuasan')) return 88.5;
    return 91.2;
  }

  if (dataType === 'Currency') {
    return 1500000000;
  }

  if (dataType === 'Date') {
    return '2026-06-30';
  }

  if (dataType === 'Boolean') {
    return true;
  }

  if (exampleValue && exampleValue.trim() !== '') {
    return exampleValue.trim();
  }

  return 'Data Terverifikasi';
}

async function main() {
  console.log('Seeding demo data for ISO 30414 Dashboard...');

  // 1. Get Admin User
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!adminUser) {
    throw new Error('No admin user found. Run db:seed first.');
  }

  // 2. Get Metrics and Reporting Periods
  const metrics = await prisma.metric.findMany({
    include: { attributes: true, isoArea: true },
    where: { status: 'Active' },
  });

  const periods = await prisma.reportingPeriod.findMany({
    where: { periodType: PeriodType.Annual },
    orderBy: { year: 'asc' },
  });

  console.log(`Found ${metrics.length} active metrics and ${periods.length} annual reporting periods.`);

  const statusDistribution: ValueStatus[] = [
    ValueStatus.Approved,
    ValueStatus.Approved,
    ValueStatus.Approved,
    ValueStatus.Approved,
    ValueStatus.Approved,
    ValueStatus.Approved,
    ValueStatus.Submitted,
    ValueStatus.UnderReview,
    ValueStatus.NeedsRevision,
    ValueStatus.Draft,
  ];

  for (const period of periods) {
    console.log(`Seeding metric values for ${period.label} (Year ${period.year})...`);

    let count = 0;
    for (let i = 0; i < metrics.length; i++) {
      const metric = metrics[i];

      // Pick status deterministically based on index so it's consistent
      let status: ValueStatus = statusDistribution[i % statusDistribution.length];

      // For older years (2024, 2025), mark mostly as Approved
      if (period.year < 2026) {
        status = ValueStatus.Approved;
      }

      const attributeValues: Record<string, unknown> = {};
      for (const attr of metric.attributes) {
        attributeValues[attr.id] = generateValueForAttribute(attr.name, attr.dataType, attr.exampleValue);
      }

      // Calculated result simulation
      let result = 85.5 + ((i % 15) * 0.8);
      if (metric.metricType === 'Required') {
        result = Math.min(100, Math.max(60, result));
      }

      await prisma.metricValue.upsert({
        where: {
          metricId_reportingPeriodId: {
            metricId: metric.id,
            reportingPeriodId: period.id,
          },
        },
        update: {
          status,
          attributeValues: attributeValues as any,
          calculatedResult: result,
          submittedById: adminUser.id,
          notes: `Data pelaporan ISO 30414 disubmit untuk periode ${period.label}`,
          submittedAt: new Date(),
        },
        create: {
          metricId: metric.id,
          reportingPeriodId: period.id,
          status,
          attributeValues: attributeValues as any,
          calculatedResult: result,
          submittedById: adminUser.id,
          notes: `Data pelaporan ISO 30414 disubmit untuk periode ${period.label}`,
          submittedAt: new Date(),
        },
      });

      count++;
    }
    console.log(`Successfully seeded ${count} metric values for ${period.label}.`);

    // Add Data Quality Score for each period
    const completeness = period.year === 2026 ? 93.8 : period.year === 2025 ? 90.5 : 86.0;
    const accuracy = period.year === 2026 ? 91.2 : period.year === 2025 ? 88.0 : 84.5;
    const consistency = period.year === 2026 ? 94.5 : period.year === 2025 ? 91.0 : 87.0;
    const timeliness = period.year === 2026 ? 89.0 : period.year === 2025 ? 85.5 : 82.0;
    const overall = (completeness + accuracy + consistency + timeliness) / 4;

    await prisma.dataQualityScore.deleteMany({
      where: { reportingPeriodId: period.id, isoAreaId: null },
    });

    await prisma.dataQualityScore.create({
      data: {
        reportingPeriodId: period.id,
        isoAreaId: null,
        overallScore: overall,
        completenessScore: completeness,
        accuracyScore: accuracy,
        consistencyScore: consistency,
        timelinessScore: timeliness,
        details: {
          summary: `Data Quality Assessment for ${period.label}`,
          generatedAt: new Date().toISOString(),
        },
      },
    });
  }

  console.log('Demo data seeding completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
