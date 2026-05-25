import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1779305937137 implements MigrationInterface {
    name = ' $npmConfigName1779305937137'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_fund_access_user_fund_report_type"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fund_access_user_fund_report_type" ON "fund_access" ("reportType", "userId", "fundId") `);
    }

}
