import { AppDataSource } from './data-source.js';
import Jurisdiction from '../modules/jurisdiction/entities/jurisdiction.entity.js';
import Service from '../modules/service/entities/service.entity.js';
import Step from '../modules/step/entities/step.entity.js';
import Document from '../modules/document/entities/document.entity.js';
import ServiceDocument from '../modules/document/entities/service-document.entity.js';
import { JURISDICTION_SEEDS } from './seeds/jurisdictions.seed.js';
import { DEVELOPMENT_SERVICE_SEEDS } from './seeds/services.seed.js';
import { EntityManager, In } from 'typeorm';

async function seedJurisdictions(manager: EntityManager): Promise<void> {
  await manager.getRepository(Jurisdiction).upsert([...JURISDICTION_SEEDS], {
    conflictPaths: ['code'],
    skipUpdateIfNoValuesChanged: true,
  });
}

async function seedDevelopmentServices(manager: EntityManager): Promise<void> {
  const jurisdictionRepository = manager.getRepository(Jurisdiction);
  const serviceRepository = manager.getRepository(Service);
  const stepRepository = manager.getRepository(Step);
  const documentRepository = manager.getRepository(Document);
  const serviceDocumentRepository = manager.getRepository(ServiceDocument);

  const jurisdictionCodes = [
    ...new Set(DEVELOPMENT_SERVICE_SEEDS.map((seed) => seed.jurisdictionCode)),
  ];
  const jurisdictions = await jurisdictionRepository.find({
    where: { code: In(jurisdictionCodes) },
  });
  const jurisdictionByCode = new Map(
    jurisdictions.map((jurisdiction) => [jurisdiction.code, jurisdiction]),
  );

  for (const code of jurisdictionCodes) {
    if (!jurisdictionByCode.has(code)) {
      throw new Error(`Cannot seed services: jurisdiction ${code} is missing`);
    }
  }

  const lastVerifiedAt = new Date('2026-09-01T00:00:00.000Z');
  await serviceRepository.upsert(
    DEVELOPMENT_SERVICE_SEEDS.map((seed) => ({
      id: seed.id,
      name: seed.name,
      description: seed.description,
      eligibility: seed.eligibility,
      sourceUrl: seed.sourceUrl,
      officialUrl: seed.officialUrl,
      feesType: seed.feesType,
      feesText: seed.feesText,
      processingTime: seed.processingTime,
      isActive: true,
      lastVerifiedAt,
      jurisdiction: jurisdictionByCode.get(seed.jurisdictionCode),
    })),
    {
      conflictPaths: ['id'],
      skipUpdateIfNoValuesChanged: true,
    },
  );

  const documentSeeds = new Map<
    string,
    { description: string; example: string | null }
  >();
  for (const serviceSeed of DEVELOPMENT_SERVICE_SEEDS) {
    for (const document of serviceSeed.requiredDocuments) {
      documentSeeds.set(document.description, { ...document });
    }
  }

  await documentRepository.upsert([...documentSeeds.values()], {
    conflictPaths: ['description'],
    skipUpdateIfNoValuesChanged: true,
  });

  const storedDocuments = await documentRepository.find({
    where: { description: In([...documentSeeds.keys()]) },
  });
  const documentByDescription = new Map(
    storedDocuments.map((document) => [document.description, document]),
  );
  const serviceIds = DEVELOPMENT_SERVICE_SEEDS.map((seed) => seed.id);

  // Rebuild child rows so rerunning the development seed converges to the
  // current fixture instead of retaining removed steps or document links.
  await manager
    .createQueryBuilder()
    .delete()
    .from(Step)
    .where('"serviceId" IN (:...serviceIds)', { serviceIds })
    .execute();
  await manager
    .createQueryBuilder()
    .delete()
    .from(ServiceDocument)
    .where('"serviceId" IN (:...serviceIds)', { serviceIds })
    .execute();

  const serviceById = new Map(
    serviceIds.map((id) => [id, serviceRepository.create({ id })]),
  );
  const steps = DEVELOPMENT_SERVICE_SEEDS.flatMap((serviceSeed) =>
    serviceSeed.steps.map((stepText, index) =>
      stepRepository.create({
        step_text: stepText,
        step_order: index + 1,
        service: serviceById.get(serviceSeed.id),
      }),
    ),
  );
  await stepRepository.save(steps);

  const serviceDocuments = DEVELOPMENT_SERVICE_SEEDS.flatMap((serviceSeed) =>
    serviceSeed.requiredDocuments.map((documentSeed) => {
      const document = documentByDescription.get(documentSeed.description);
      if (!document) {
        throw new Error(
          `Cannot link missing document: ${documentSeed.description}`,
        );
      }

      return serviceDocumentRepository.create({
        service: serviceById.get(serviceSeed.id),
        document,
      });
    }),
  );
  await serviceDocumentRepository.save(serviceDocuments);
}

async function seed(): Promise<void> {
  const includeDevelopmentData = process.argv.includes('--development');
  if (includeDevelopmentData && process.env.NODE_ENV === 'production') {
    throw new Error('Development seed data cannot run in production');
  }

  await AppDataSource.initialize();

  try {
    await AppDataSource.transaction(async (manager) => {
      await seedJurisdictions(manager);
      if (includeDevelopmentData) {
        await seedDevelopmentServices(manager);
      }
    });

    const rows = await AppDataSource.getRepository(Jurisdiction).find({
      order: { code: 'ASC' },
      select: { code: true, name: true },
    });

    console.log('Seeded jurisdictions:');
    for (const row of rows) {
      console.log(`- ${row.code}: ${row.name}`);
    }
    if (includeDevelopmentData) {
      console.log(
        `Seeded development services: ${DEVELOPMENT_SERVICE_SEEDS.length}`,
      );
    }
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

void seed().catch((error: unknown) => {
  console.error('Seed failed');
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exitCode = 1;
});
