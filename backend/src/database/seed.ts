import { AppDataSource } from './data-source.js';
import Jurisdiction from '../modules/jurisdiction/entities/jurisdiction.entity.js';
import { JURISDICTION_SEEDS } from './seeds/jurisdictions.seed.js';

async function seed(): Promise<void> {
  await AppDataSource.initialize();

  try {
    const jurisdictions = AppDataSource.getRepository(Jurisdiction);

    await jurisdictions.upsert([...JURISDICTION_SEEDS], {
      conflictPaths: ['code'],
      skipUpdateIfNoValuesChanged: true,
    });

    const rows = await jurisdictions.find({
      order: { code: 'ASC' },
      select: { code: true, name: true },
    });

    console.log('Seeded jurisdictions:');
    for (const row of rows) {
      console.log(`- ${row.code}: ${row.name}`);
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
