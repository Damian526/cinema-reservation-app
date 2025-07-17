import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVersionToReservations1752781711527 implements MigrationInterface {
    name = 'AddVersionToReservations1752781711527'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservations\` ADD \`version\` int UNSIGNED NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservations\` DROP COLUMN \`version\``);
    }

}
