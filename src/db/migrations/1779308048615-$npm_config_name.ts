import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSingulareLiquidadosBaixadosV2Access1779308048615
  implements MigrationInterface
{
  name = 'AddSingulareLiquidadosBaixadosV2Access1779308048615';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "fund_access" ("createdAt", "updatedAt", "reportType", "userId", "fundId")
            SELECT now(), now(), 'LIQUIDADOS_BAIXADOS_V2', 2, fund.id
            FROM "fund" fund
            WHERE fund."externalCode" = '58396668000180'
                AND NOT EXISTS (
                    SELECT 1
                    FROM "fund_access" access
                    WHERE access."userId" = 2
                        AND access."fundId" = fund.id
                        AND access."reportType" = 'LIQUIDADOS_BAIXADOS_V2'
                )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DELETE FROM "fund_access"
            WHERE "userId" = 2
                AND "reportType" = 'LIQUIDADOS_BAIXADOS_V2'
                AND "fundId" IN (
                    SELECT id
                    FROM "fund"
                    WHERE "externalCode" = '58396668000180'
                )
        `);
  }
}
