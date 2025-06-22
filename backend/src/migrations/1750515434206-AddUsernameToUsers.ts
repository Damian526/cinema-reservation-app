import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsernameToUsers1750515434206 implements MigrationInterface {
  name = 'AddUsernameToUsers1750515434206';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, add the column as nullable
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`username\` varchar(50) NULL`,
    );

    // Update existing users with a default username based on their email
    await queryRunner.query(
      `UPDATE \`users\` SET \`username\` = CONCAT('user_', \`id\`) WHERE \`username\` IS NULL`,
    );

    // Now make it NOT NULL and add unique constraint
    await queryRunner.query(
      `ALTER TABLE \`users\` MODIFY \`username\` varchar(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\``,
    );
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`username\``);
  }
}
