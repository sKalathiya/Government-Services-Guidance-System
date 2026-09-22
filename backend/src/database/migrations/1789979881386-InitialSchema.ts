import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1789979881386 implements MigrationInterface {
    name = 'InitialSchema1789979881386'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "jurisdictions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "code" character varying(255) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e33b5f6afb84e58de0c2399edb0" UNIQUE ("code"), CONSTRAINT "PK_7cc0bed21c9e2b32866c1109ec5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "steps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "step_text" character varying(255) NOT NULL, "step_order" integer NOT NULL, "serviceId" uuid NOT NULL, CONSTRAINT "PK_65f86ac8996204d11f915f66a5b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."UserRole" AS ENUM('USER', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "passwordHash" character varying(255) NOT NULL, "role" "public"."UserRole" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users"  ("email") `);
        await queryRunner.query(`CREATE TABLE "favourite_services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "serviceId" uuid NOT NULL, CONSTRAINT "UQ_b73c9acc62872142700310fa4e8" UNIQUE ("userId", "serviceId"), CONSTRAINT "PK_ecc07c7a8ce334acb2d5f8ed8cd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."FeesType" AS ENUM('FREE', 'UNKNOWN', 'SPECIFIED')`);
        await queryRunner.query(`CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text NOT NULL, "eligibility" text NOT NULL, "sourceUrl" character varying(255) NOT NULL, "officialUrl" character varying(255) NOT NULL, "feesType" "public"."FeesType" NOT NULL DEFAULT 'UNKNOWN', "feesText" character varying(255), "processingTime" character varying(255), "isActive" boolean NOT NULL DEFAULT true, "lastVerifiedAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "jurisdictionId" uuid NOT NULL, CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service_documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "documentId" uuid NOT NULL, "serviceId" uuid NOT NULL, CONSTRAINT "UQ_283f6e5a60d4dff717f7d88c547" UNIQUE ("documentId", "serviceId"), CONSTRAINT "PK_fa211498842477e8bdd2ba98001" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" text NOT NULL, "example" text, CONSTRAINT "UQ_f2cdf17cfa575bf990dc9fd3529" UNIQUE ("description"), CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "steps" ADD CONSTRAINT "FK_a98dd6f1d373bb6d75826b75531" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favourite_services" ADD CONSTRAINT "FK_8b8b6bf3f10ae00b9c092e1b7b9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favourite_services" ADD CONSTRAINT "FK_362160a4a455784d39dd371e349" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_73f737a53981ff01622876c3bce" FOREIGN KEY ("jurisdictionId") REFERENCES "jurisdictions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_documents" ADD CONSTRAINT "FK_8a1eb69d9781bc979132a787433" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_documents" ADD CONSTRAINT "FK_0453b11123564c58600bb14dadd" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_documents" DROP CONSTRAINT "FK_0453b11123564c58600bb14dadd"`);
        await queryRunner.query(`ALTER TABLE "service_documents" DROP CONSTRAINT "FK_8a1eb69d9781bc979132a787433"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_73f737a53981ff01622876c3bce"`);
        await queryRunner.query(`ALTER TABLE "favourite_services" DROP CONSTRAINT "FK_362160a4a455784d39dd371e349"`);
        await queryRunner.query(`ALTER TABLE "favourite_services" DROP CONSTRAINT "FK_8b8b6bf3f10ae00b9c092e1b7b9"`);
        await queryRunner.query(`ALTER TABLE "steps" DROP CONSTRAINT "FK_a98dd6f1d373bb6d75826b75531"`);
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TABLE "service_documents"`);
        await queryRunner.query(`DROP TABLE "services"`);
        await queryRunner.query(`DROP TYPE "public"."FeesType"`);
        await queryRunner.query(`DROP TABLE "favourite_services"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."UserRole"`);
        await queryRunner.query(`DROP TABLE "steps"`);
        await queryRunner.query(`DROP TABLE "jurisdictions"`);
    }

}
