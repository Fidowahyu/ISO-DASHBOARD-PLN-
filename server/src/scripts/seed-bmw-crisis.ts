import { PrismaClient, PeriodType, ValueStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBmwCrisis() {
  console.log('Seeding BMW Group (Critical Crisis Scenario) into Database...');

  // 1. Get or create BMW Reporting Periods (2021 - 2026)
  const years = [2021, 2022, 2023, 2024, 2025, 2026];
  const periodIds: Record<number, string> = {};

  for (const year of years) {
    const p = await prisma.reportingPeriod.upsert({
      where: { year_periodType: { year, periodType: PeriodType.Annual } },
      update: { label: `${year} Annual` },
      create: {
        year,
        periodType: PeriodType.Annual,
        label: `${year} Annual`,
        startDate: new Date(Date.UTC(year, 0, 1)),
        endDate: new Date(Date.UTC(year, 11, 31, 23, 59, 59)),
        status: year === 2026 ? 'Open' : 'Closed',
      },
    });
    periodIds[year] = p.id;
  }

  // 2. Fetch active metrics
  const metrics = await prisma.metric.findMany({
    where: { status: 'Active' },
    include: { isoArea: true },
  });

  console.log(`Found ${metrics.length} metrics. Generating severe crisis values...`);

  // Severe Crisis Metric Overrides for BMW Group
  for (const metric of metrics) {
    const areaNo = metric.isoArea.areaNumber;
    const metricNo = metric.metricNumber;

    for (const year of years) {
      const periodId = periodIds[year];
      let valPct = 42.0 + ((metricNo * 5 + year) % 18); // Low results (40% - 60%)
      let status: ValueStatus = year < 2026 ? ValueStatus.Approved : metricNo % 2 === 0 ? ValueStatus.Draft : ValueStatus.UnderReview;

      // Specific severe crisis overrides
      if (areaNo === 5) { // Health & Safety
        valPct = 32.5; // Severe accident rate / LTIFR spike
      } else if (areaNo === 11) { // Availability & Turnover
        valPct = 38.0; // High 14.8% turnover, high absenteeism
      } else if (areaNo === 6) { // Leadership & Engagement
        valPct = 42.1; // Low morale crisis
      } else if (areaNo === 7) { // Compliance
        valPct = 62.4; // Compliance audit findings
      }

      await prisma.metricValue.upsert({
        where: { metricId_reportingPeriodId: { metricId: metric.id, reportingPeriodId: periodId } },
        update: {
          calculatedResult: valPct,
          status,
          attributeValues: {
            severeAlert: true,
            notes: `BMW Group Severe Crisis: High Risk Value recorded for year ${year}`,
          },
        },
        create: {
          metricId: metric.id,
          reportingPeriodId: periodId,
          calculatedResult: valPct,
          status,
          attributeValues: {
            severeAlert: true,
            notes: `BMW Group Severe Crisis: High Risk Value recorded for year ${year}`,
          },
        },
      });
    }
  }

  // 3. Seed Low Data Quality Scores (Grade F / Red Alert) for all 6 years
  for (const year of years) {
    const periodId = periodIds[year];
    const existing = await prisma.dataQualityScore.findFirst({
      where: { reportingPeriodId: periodId, isoAreaId: null },
    });

    if (existing) {
      await prisma.dataQualityScore.update({
        where: { id: existing.id },
        data: {
          overallScore: 48.2,
          completenessScore: 52.4,
          accuracyScore: 44.0,
          consistencyScore: 46.5,
          timelinessScore: 50.0,
        },
      });
    } else {
      await prisma.dataQualityScore.create({
        data: {
          reportingPeriodId: periodId,
          isoAreaId: null,
          overallScore: 48.2,
          completenessScore: 52.4,
          accuracyScore: 44.0,
          consistencyScore: 46.5,
          timelinessScore: 50.0,
        },
      });
    }
  }

  console.log('BMW Group Severe Crisis Scenario seeded successfully into Database!');
}

seedBmwCrisis().catch(console.error).finally(() => prisma.$disconnect());
