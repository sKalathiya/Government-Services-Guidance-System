import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedColumnNameEmbeddingVersion1791267946528 implements MigrationInterface {
    name = 'ChangedColumnNameEmbeddingVersion1791267946528'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" RENAME COLUMN "embeddingVersion" TO "embedding_version"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" RENAME COLUMN "embedding_version" TO "embeddingVersion"`);
    }

}
