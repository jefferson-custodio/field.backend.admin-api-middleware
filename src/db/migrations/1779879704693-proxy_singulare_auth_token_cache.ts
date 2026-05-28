import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProxySingulareAuthTokenCache1779879704693
  implements MigrationInterface
{
  name = 'ProxySingulareAuthTokenCache1779879704693';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "proxy_singulare_auth_token" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "provider" character varying(32) NOT NULL, "encryptedToken" text NOT NULL, "expiresAt" TIMESTAMP NOT NULL, CONSTRAINT "UQ_c7f71ba2baad5f0a559cacdd43d" UNIQUE ("provider"), CONSTRAINT "PK_5d48e56a5ba8626b86681deb3e5" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "proxy_singulare_auth_token"`);
  }
}
