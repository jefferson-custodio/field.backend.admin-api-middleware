import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSingulareMovimentoAbertoAccess1779308513704
  implements MigrationInterface
{
  name = 'AddSingulareMovimentoAbertoAccess1779308513704';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "fund_access" ("createdAt", "updatedAt", "reportType", "userId", "fundId")
            SELECT now(), now(), 'MOVIMENTO_ABERTO', 2, fund.id
            FROM "fund" fund
            WHERE fund."externalCode" = '58396668000180'
                AND NOT EXISTS (
                    SELECT 1
                    FROM "fund_access" access
                    WHERE access."userId" = 2
                        AND access."fundId" = fund.id
                        AND access."reportType" = 'MOVIMENTO_ABERTO'
                )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DELETE FROM "fund_access"
            WHERE "userId" = 2
                AND "reportType" = 'MOVIMENTO_ABERTO'
                AND "fundId" IN (
                    SELECT id
                    FROM "fund"
                    WHERE "externalCode" = '58396668000180'
                )
        `);
  }
}
