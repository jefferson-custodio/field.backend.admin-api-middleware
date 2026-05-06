import { MigrationInterface, QueryRunner } from "typeorm";

export class Base1757347185673 implements MigrationInterface {
    name = 'Base1757347185673'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('system', 'master', 'manager')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "email" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL, "password" character varying, "createdByUserId" integer NOT NULL, "recoveryToken" character varying(64), "recoveryTokenCreatedAt" TIMESTAMP NOT NULL DEFAULT now(), "passwordLastUpdatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."auth_login_attempt_result_enum" AS ENUM('authorized', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "auth_login_attempt" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "result" "public"."auth_login_attempt_result_enum" NOT NULL, "ip" character varying NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_576f79397d3736a0172e5982275" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."version_type_enum" AS ENUM('create', 'update', 'login', 'delete')`);
        await queryRunner.query(`CREATE TABLE "version" ("id" SERIAL NOT NULL, "entity" character varying NOT NULL, "entityId" integer NOT NULL, "type" "public"."version_type_enum" NOT NULL, "old_data" text, "new_data" text, "userIdentityId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4fb5fbb15a43da9f35493107b1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e9c122ed9ac8093f81d3ca6ea7" ON "version" ("entity") `);
        await queryRunner.query(`CREATE INDEX "IDX_15af1f6fc250bd452b94dfe343" ON "version" ("entityId") `);
        await queryRunner.query(`CREATE INDEX "IDX_9a1ac586d38959e5ed5357fb9f" ON "version" ("userIdentityId") `);
        await queryRunner.query(`ALTER TABLE "auth_login_attempt" ADD CONSTRAINT "FK_2fa49d4afe11c74128c5b168cd3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth_login_attempt" DROP CONSTRAINT "FK_2fa49d4afe11c74128c5b168cd3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9a1ac586d38959e5ed5357fb9f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_15af1f6fc250bd452b94dfe343"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e9c122ed9ac8093f81d3ca6ea7"`);
        await queryRunner.query(`DROP TABLE "version"`);
        await queryRunner.query(`DROP TYPE "public"."version_type_enum"`);
        await queryRunner.query(`DROP TABLE "auth_login_attempt"`);
        await queryRunner.query(`DROP TYPE "public"."auth_login_attempt_result_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}
