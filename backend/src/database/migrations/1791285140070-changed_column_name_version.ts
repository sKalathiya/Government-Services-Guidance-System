import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedColumnNameVersion1791285140070 implements MigrationInterface {
    name = 'ChangedColumnNameVersion1791285140070'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" RENAME COLUMN "embedding_version" TO "version"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" RENAME COLUMN "version" TO "embedding_version"`);
    }

}
