// apps/backend/src/database/seeds/clear.seeder.ts

import { AppDataSource } from '../../config/data-source';

async function clearDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('🔌 Connected to database');

    const queryRunner = AppDataSource.createQueryRunner();

    // Disable foreign key checks (PostgreSQL)
    await queryRunner.query(`SET session_replication_role = 'replica'`);

    // List of tables to truncate (order matters for dependencies)
    const tables = [
      'order_items',
      'orders',
      'cart_items',
      'carts',
      'product_variants',
      'product_images',
      'products',
      'categories',
      'brands',
      'users',
      'campaign_products',
      'campaign',
      'payments',
      // Add other tables if needed
    ];

    console.log('🗑️  Clearing tables...');
    for (const table of tables) {
      try {
        await queryRunner.query(
          `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`,
        );
        console.log(`   ✓ Cleared ${table}`);
      } catch {
        console.log(`   ⚠ Skipped ${table} (might not exist)`);
      }
    }

    // Re-enable foreign key checks
    await queryRunner.query(`SET session_replication_role = 'origin'`);

    await queryRunner.release();
    console.log('✅ Database cleared successfully');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
}

void clearDatabase();
