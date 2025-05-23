import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1747862133299 implements MigrationInterface {
    name = 'SchemaUpdate1747862133299'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."crop_status_enum" AS ENUM('planted', 'growing', 'awaiting_harvest', 'harvested', 'canceled')`);
        await queryRunner.query(`CREATE TABLE "crop" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "seed" character varying NOT NULL, "plantedArea" double precision NOT NULL, "status" "public"."crop_status_enum" NOT NULL DEFAULT 'planted', "monthPlanted" integer NOT NULL, "yearPlanted" integer NOT NULL, "monthHarvested" integer, "yearHarvested" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "harvest_id" uuid, CONSTRAINT "PK_f306910b05e2d54ed972a536a12" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."harvest_status_enum" AS ENUM('preparing_land', 'planted', 'growing', 'harvested', 'canceled')`);
        await queryRunner.query(`CREATE TABLE "harvest" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "totalArea" double precision NOT NULL, "plantedArea" double precision NOT NULL, "enabledArea" double precision NOT NULL, "status" "public"."harvest_status_enum" NOT NULL DEFAULT 'preparing_land', "monthPlanted" integer, "yearPlanted" integer, "monthHarvested" integer, "yearHarvested" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "crop_id" uuid, "farm_id" uuid, CONSTRAINT "PK_84a837e6c60baad24c5a4125f67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "crop" ADD CONSTRAINT "FK_a0dad5ca8b8564d758f2107f99e" FOREIGN KEY ("harvest_id") REFERENCES "harvest"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "harvest" ADD CONSTRAINT "FK_6a5287806ab172f850e622753d2" FOREIGN KEY ("crop_id") REFERENCES "crop"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "harvest" ADD CONSTRAINT "FK_165980f2aff191b976f0e703093" FOREIGN KEY ("farm_id") REFERENCES "farm"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "harvest" DROP CONSTRAINT "FK_165980f2aff191b976f0e703093"`);
        await queryRunner.query(`ALTER TABLE "harvest" DROP CONSTRAINT "FK_6a5287806ab172f850e622753d2"`);
        await queryRunner.query(`ALTER TABLE "crop" DROP CONSTRAINT "FK_a0dad5ca8b8564d758f2107f99e"`);
        await queryRunner.query(`DROP TABLE "harvest"`);
        await queryRunner.query(`DROP TYPE "public"."harvest_status_enum"`);
        await queryRunner.query(`DROP TABLE "crop"`);
        await queryRunner.query(`DROP TYPE "public"."crop_status_enum"`);
    }

}
