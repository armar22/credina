import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMembersTable1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'members',
        columns: [
          {
            name: 'member_id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'nik',
            type: 'varchar',
            length: '16',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'dob',
            type: 'date',
          },
          {
            name: 'gender',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'text',
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'province',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'postal_code',
            type: 'varchar',
            length: '10',
          },
          {
            name: 'photo_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'ktp_image_url',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'registration_date',
            type: 'timestamp',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'active'",
          },
          {
            name: 'created_by_officer_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('members');
  }
}
