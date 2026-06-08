import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVariantSkuToOrderItems1779000000000 implements MigrationInterface {
  name = 'AddVariantSkuToOrderItems1779000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "variant_sku" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN IF EXISTS "variant_sku"`,
    );
  }
}
