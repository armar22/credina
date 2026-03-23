import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddOcrFieldsToMembers1700000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'members',
      new TableColumn({
        name: 'ocr_nik',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'members',
      new TableColumn({
        name: 'ocr_name',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'members',
      new TableColumn({
        name: 'ocr_dob',
        type: 'date',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'members',
      new TableColumn({
        name: 'ocr_gender',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'members',
      new TableColumn({
        name: 'ocr_address',
        type: 'text',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'members',
      new TableColumn({
        name: 'ocr_confidence',
        type: 'decimal',
        precision: 5,
        scale: 2,
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'members',
      new TableColumn({
        name: 'ktp_verification_status',
        type: 'varchar',
        length: '30',
        default: "'pending'",
      }),
    );
    await queryRunner.addColumn(
      'members',
      new TableColumn({
        name: 'ktp_verification_notes',
        type: 'text',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'members',
      new TableColumn({
        name: 'verified_by',
        type: 'uuid',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'members',
      new TableColumn({
        name: 'verified_at',
        type: 'timestamp',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('members', 'verified_at');
    await queryRunner.dropColumn('members', 'verified_by');
    await queryRunner.dropColumn('members', 'ktp_verification_notes');
    await queryRunner.dropColumn('members', 'ktp_verification_status');
    await queryRunner.dropColumn('members', 'ocr_confidence');
    await queryRunner.dropColumn('members', 'ocr_address');
    await queryRunner.dropColumn('members', 'ocr_gender');
    await queryRunner.dropColumn('members', 'ocr_dob');
    await queryRunner.dropColumn('members', 'ocr_name');
    await queryRunner.dropColumn('members', 'ocr_nik');
  }
}
