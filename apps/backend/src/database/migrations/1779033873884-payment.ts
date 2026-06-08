import { MigrationInterface, QueryRunner } from 'typeorm';

export class Payment1779033873884 implements MigrationInterface {
  name = 'Payment1779033873884';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "provider_ref_id" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "provider_ref_id"`,
    );
  }
}
