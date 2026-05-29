import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameReceivablesReportTypeEnum1780056018873
  implements MigrationInterface
{
  name = 'RenameReceivablesReportTypeEnum1780056018873';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM pg_type type
                    INNER JOIN pg_namespace namespace ON namespace.oid = type.typnamespace
                    INNER JOIN pg_enum enum_value ON enum_value.enumtypid = type.oid
                    WHERE namespace.nspname = 'public'
                        AND type.typname = 'user_fund_access_reporttype_enum'
                        AND enum_value.enumlabel = 'RECEIVABLES'
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM pg_type type
                    INNER JOIN pg_namespace namespace ON namespace.oid = type.typnamespace
                    INNER JOIN pg_enum enum_value ON enum_value.enumtypid = type.oid
                    WHERE namespace.nspname = 'public'
                        AND type.typname = 'user_fund_access_reporttype_enum'
                        AND enum_value.enumlabel = 'RECEIVABLE'
                ) THEN
                    ALTER TYPE "public"."user_fund_access_reporttype_enum" RENAME VALUE 'RECEIVABLES' TO 'RECEIVABLE';
                END IF;
            END
            $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM pg_type type
                    INNER JOIN pg_namespace namespace ON namespace.oid = type.typnamespace
                    INNER JOIN pg_enum enum_value ON enum_value.enumtypid = type.oid
                    WHERE namespace.nspname = 'public'
                        AND type.typname = 'user_fund_access_reporttype_enum'
                        AND enum_value.enumlabel = 'RECEIVABLE'
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM pg_type type
                    INNER JOIN pg_namespace namespace ON namespace.oid = type.typnamespace
                    INNER JOIN pg_enum enum_value ON enum_value.enumtypid = type.oid
                    WHERE namespace.nspname = 'public'
                        AND type.typname = 'user_fund_access_reporttype_enum'
                        AND enum_value.enumlabel = 'RECEIVABLES'
                ) THEN
                    ALTER TYPE "public"."user_fund_access_reporttype_enum" RENAME VALUE 'RECEIVABLE' TO 'RECEIVABLES';
                END IF;
            END
            $$;
        `);
  }
}
