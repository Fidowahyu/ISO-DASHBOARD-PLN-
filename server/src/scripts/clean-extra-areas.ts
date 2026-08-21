import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanExtraAreas() {
  console.log('Finding extra ISO areas (areaNumber > 12)...');
  const extraAreas = await prisma.iSOArea.findMany({
    where: { areaNumber: { gt: 12 } },
    include: { metrics: true },
  });

  console.log(`Found ${extraAreas.length} extra areas to delete:`, extraAreas.map(a => `${a.areaNumber}: ${a.name}`));

  for (const area of extraAreas) {
    const metricIds = area.metrics.map(m => m.id);

    // Delete dependent metric values, PICs, attributes, formulas, rules
    if (metricIds.length > 0) {
      await prisma.metricValue.deleteMany({ where: { metricId: { in: metricIds } } });
      await prisma.metricPIC.deleteMany({ where: { metricId: { in: metricIds } } });
      await prisma.metricAttribute.deleteMany({ where: { metricId: { in: metricIds } } });
      await prisma.metricFormula.deleteMany({ where: { metricId: { in: metricIds } } });
      await prisma.metricValidationRule.deleteMany({ where: { metricId: { in: metricIds } } });
      await prisma.metric.deleteMany({ where: { isoAreaId: area.id } });
    }

    await prisma.dataQualityScore.deleteMany({ where: { isoAreaId: area.id } });
    await prisma.iSOArea.delete({ where: { id: area.id } });
  }

  console.log('Successfully cleaned up all extra non-ISO areas!');

  const remaining = await prisma.iSOArea.findMany({ orderBy: { areaNumber: 'asc' } });
  console.log('Remaining areas in DB (Strictly 12):', remaining.map(a => `${a.areaNumber}. ${a.name}`));
}

cleanExtraAreas().catch(console.error).finally(() => prisma.$disconnect());
