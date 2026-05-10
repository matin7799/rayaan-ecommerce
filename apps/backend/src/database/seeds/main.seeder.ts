// apps/backend/src/database/seeds/main.seeder.ts

import { AppDataSource } from '../../config/data-source';
import { seedCategories } from './category.seeder';
import { seedUsers } from './user.seeder';
import { seedBrands } from './brand.seeder';
import { seedTags } from './tag.seeder';

async function runSeeders() {
  console.log('🚀 Starting database seeding...\n');

  try {
    // Initialize data source
    await AppDataSource.initialize();
    console.log('✅ Database connection established\n');

    // Run seeders in order
    await seedCategories(AppDataSource);
    await seedBrands(AppDataSource);
    await seedTags(AppDataSource);
    await seedUsers(AppDataSource);

    console.log('🎉 All seeders completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('\n👋 Database connection closed');
  }
}

void runSeeders();
