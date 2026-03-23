import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { FieldVerification, VerificationStatus } from '../entities/field-verification.entity';

@Injectable()
export class FieldVerificationService {
  constructor(
    @InjectRepository(FieldVerification)
    private verificationRepository: Repository<FieldVerification>,
  ) {}

  async findAll(filters?: {
    applicationId?: string;
    officerId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: FieldVerification[]; total: number }> {
    const where: FindOptionsWhere<FieldVerification> = {};

    if (filters?.applicationId) {
      where.applicationId = filters.applicationId as any;
    }
    if (filters?.officerId) {
      where.officerId = filters.officerId as any;
    }
    if (filters?.status) {
      where.verificationStatus = filters.status as VerificationStatus;
    }

    const [data, total] = await this.verificationRepository.findAndCount({
      where,
      skip: ((filters?.page || 1) - 1) * (filters?.limit || 10),
      take: filters?.limit || 10,
      order: { verificationDate: 'DESC' },
    });

    return { data, total };
  }

  async findById(verificationId: string): Promise<FieldVerification | null> {
    return this.verificationRepository.findOne({
      where: { verification_id: verificationId },
    });
  }

  async findByApplicationId(applicationId: string): Promise<FieldVerification | null> {
    return this.verificationRepository.findOne({
      where: { applicationId: applicationId as any },
      order: { verificationDate: 'DESC' },
    });
  }

  async create(createDto: Partial<FieldVerification>): Promise<FieldVerification> {
    const verification = this.verificationRepository.create({
      ...createDto,
      verificationDate: new Date(),
    });
    return this.verificationRepository.save(verification);
  }

  async update(verificationId: string, updateDto: Partial<FieldVerification>): Promise<FieldVerification> {
    await this.verificationRepository.update(verificationId, updateDto);
    return this.findById(verificationId);
  }

  async delete(verificationId: string): Promise<void> {
    await this.verificationRepository.delete(verificationId);
  }

  async getStats(): Promise<{
    total: number;
    pending: number;
    passed: number;
    failed: number;
  }> {
    const [total, pending, passed, failed] = await Promise.all([
      this.verificationRepository.count(),
      this.verificationRepository.count({
        where: { verificationStatus: VerificationStatus.PENDING },
      }),
      this.verificationRepository.count({
        where: { verificationStatus: VerificationStatus.PASSED },
      }),
      this.verificationRepository.count({
        where: { verificationStatus: VerificationStatus.FAILED },
      }),
    ]);

    return { total, pending, passed, failed };
  }
}
