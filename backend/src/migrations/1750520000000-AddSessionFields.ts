import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSessionFields1750520000000 implements MigrationInterface {
    name = 'AddSessionFields1750520000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sessions\` ADD \`endTime\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sessions\` ADD \`price\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sessions\` ADD \`roomNumber\` smallint UNSIGNED NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sessions\` DROP COLUMN \`roomNumber\``);
        await queryRunner.query(`ALTER TABLE \`sessions\` DROP COLUMN \`price\``);
        await queryRunner.query(`ALTER TABLE \`sessions\` DROP COLUMN \`endTime\``);
    }
}
