import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAssetAndShareholderToReportTypeEnum1780054434852
  implements MigrationInterface
{
  name = 'AddAssetAndShareholderToReportTypeEnum1780054434852';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."user_fund_access_reporttype_enum" ADD VALUE IF NOT EXISTS 'ASSET'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."user_fund_access_reporttype_enum" ADD VALUE IF NOT EXISTS 'SHAREHOLDER'`,
    );
  }

  public async down(): Promise<void> {}
}
