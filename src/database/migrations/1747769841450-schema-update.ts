import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1747769841450 implements MigrationInterface {
    name = 'SchemaUpdate1747769841450'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'costumer')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "cpfCnpj" integer NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'costumer', "keycloakId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_7af4c672f664c1be8fbadae9ade" UNIQUE ("cpfCnpj"), CONSTRAINT "UQ_9eccb789f0a033a2cfa5baf4d99" UNIQUE ("keycloakId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}
