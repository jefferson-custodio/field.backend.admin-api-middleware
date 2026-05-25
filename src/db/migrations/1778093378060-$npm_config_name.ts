import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1778093378060 implements MigrationInterface {
  name = ' $npmConfigName1778093378060';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "fund" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "externalCode" character varying NOT NULL, "isActive" boolean NOT NULL, CONSTRAINT "PK_b3ac6e413e6e449bb499db1ccbc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "fund_access" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "reportType" character varying NOT NULL, "userId" integer, "fundId" integer, CONSTRAINT "PK_e76eb28a1876e304b8f0b3c88ac" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "fund_access" ADD CONSTRAINT "FK_76d1e5f154df5957f8617d3bd86" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fund_access" ADD CONSTRAINT "FK_da64c6c9bd2a86c189068f9f265" FOREIGN KEY ("fundId") REFERENCES "fund"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fund_access" DROP CONSTRAINT "FK_da64c6c9bd2a86c189068f9f265"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fund_access" DROP CONSTRAINT "FK_76d1e5f154df5957f8617d3bd86"`,
    );
    await queryRunner.query(`DROP TABLE "fund_access"`);
    await queryRunner.query(`DROP TABLE "fund"`);
  }
}
