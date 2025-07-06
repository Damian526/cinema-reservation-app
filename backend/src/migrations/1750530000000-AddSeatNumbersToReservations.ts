import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSeatNumbersToReservations1750530000000 implements MigrationInterface {
    name = 'AddSeatNumbersToReservations1750530000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists before adding it
        const table = await queryRunner.getTable("reservations");
        const hasSeatNumbersColumn = table?.columns.find(column => column.name === "seatNumbers");
        
        if (!hasSeatNumbersColumn) {
            await queryRunner.query(`ALTER TABLE \`reservations\` ADD \`seatNumbers\` json NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("reservations");
        const hasSeatNumbersColumn = table?.columns.find(column => column.name === "seatNumbers");
        
        if (hasSeatNumbersColumn) {
            await queryRunner.query(`ALTER TABLE \`reservations\` DROP COLUMN \`seatNumbers\``);
        }
    }
}
