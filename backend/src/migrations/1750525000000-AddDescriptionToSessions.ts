import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDescriptionToSessions1750525000000 implements MigrationInterface {
    name = 'AddDescriptionToSessions1750525000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists before adding it
        const table = await queryRunner.getTable("sessions");
        const hasDescriptionColumn = table?.columns.find(column => column.name === "description");
        
        if (!hasDescriptionColumn) {
            await queryRunner.query(`ALTER TABLE \`sessions\` ADD \`description\` text NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("sessions");
        const hasDescriptionColumn = table?.columns.find(column => column.name === "description");
        
        if (hasDescriptionColumn) {
            await queryRunner.query(`ALTER TABLE \`sessions\` DROP COLUMN \`description\``);
        }
    }
}
