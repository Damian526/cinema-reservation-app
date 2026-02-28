import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class AddMoviesTable1752900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create movies table
    await queryRunner.createTable(
      new Table({
        name: 'movies',
        columns: [
          {
            name: 'id',
            type: 'int',
            unsigned: true,
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '120',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'durationMinutes',
            type: 'smallint',
            unsigned: true,
          },
          {
            name: 'genre',
            type: 'varchar',
            length: '60',
          },
          {
            name: 'director',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'posterUrl',
            type: 'varchar',
            length: '512',
            isNullable: true,
          },
          {
            name: 'releaseYear',
            type: 'smallint',
            unsigned: true,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add nullable movieId FK column to sessions table
    await queryRunner.addColumn(
      'sessions',
      new TableColumn({
        name: 'movieId',
        type: 'int',
        unsigned: true,
        isNullable: true,
      }),
    );

    // Add FK constraint
    await queryRunner.createForeignKey(
      'sessions',
      new TableForeignKey({
        columnNames: ['movieId'],
        referencedTableName: 'movies',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('sessions');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('movieId') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('sessions', foreignKey);
    }

    await queryRunner.dropColumn('sessions', 'movieId');
    await queryRunner.dropTable('movies');
  }
}
