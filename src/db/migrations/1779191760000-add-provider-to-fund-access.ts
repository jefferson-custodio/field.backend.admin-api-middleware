import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProviderToFundAccess1779191760000
  implements MigrationInterface
{
  name = 'AddProviderToFundAccess1779191760000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fund_access" ADD "provider" character varying`,
    );

    await queryRunner.query(
      `UPDATE "fund_access" SET "provider" = 'vortx' WHERE "provider" IS NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "fund_access" ALTER COLUMN "provider" SET NOT NULL`,
    );

    await queryRunner.query(
      `DELETE FROM "fund_access" WHERE "id" IN (SELECT "id" FROM (SELECT "id", ROW_NUMBER() OVER (PARTITION BY "userId", "fundId", "reportType", "provider" ORDER BY "id") AS "row_number" FROM "fund_access") AS "duplicated" WHERE "duplicated"."row_number" > 1)`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fund_access_user_fund_report_type_provider" ON "fund_access" ("userId", "fundId", "reportType", "provider")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fund_access_user_fund_report_type_provider"`,
    );

    await queryRunner.query(`ALTER TABLE "fund_access" DROP COLUMN "provider"`);
  }
}
