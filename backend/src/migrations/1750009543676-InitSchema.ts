import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1750009543676 implements MigrationInterface {
    name = 'InitSchema1750009543676'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`sessions\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`movieTitle\` varchar(120) NOT NULL, \`startTime\` datetime NOT NULL, \`totalSeats\` smallint UNSIGNED NOT NULL, \`availableSeats\` smallint UNSIGNED NOT NULL DEFAULT '0', \`version\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`email\` varchar(120) NOT NULL, \`passwordHash\` varchar(255) NOT NULL, \`role\` enum ('user', 'admin') NOT NULL DEFAULT 'user', \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`reservations\` ADD CONSTRAINT \`FK_aa0e1cc2c4f54da32bf8282154c\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reservations\` ADD CONSTRAINT \`FK_0ac485f0fc8618f8486c8481a44\` FOREIGN KEY (\`sessionId\`) REFERENCES \`sessions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservations\` DROP FOREIGN KEY \`FK_0ac485f0fc8618f8486c8481a44\``);
        await queryRunner.query(`ALTER TABLE \`reservations\` DROP FOREIGN KEY \`FK_aa0e1cc2c4f54da32bf8282154c\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`sessions\``);
    }

}
