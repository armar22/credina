import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Branch } from '../entities/branch.entity';

export interface BranchStats {
  total: number;
  active: number;
  inactive: number;
}

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
  ) {}

  async findAll(filters?: {
    regionId?: string;
    city?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: Branch[]; total: number }> {
    const where: FindOptionsWhere<Branch> = {};

    if (filters?.regionId) {
      where.regionId = filters.regionId as any;
    }
    if (filters?.city) {
      where.city = filters.city;
    }
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [data, total] = await this.branchRepository.findAndCount({
      where,
      skip: ((filters?.page || 1) - 1) * (filters?.limit || 10),
      take: filters?.limit || 10,
      order: { branchName: 'ASC' },
    });

    return { data, total };
  }

  async findById(branchId: string): Promise<Branch | null> {
    return this.branchRepository.findOne({
      where: { branch_id: branchId },
    });
  }

  async findByCode(branchCode: string): Promise<Branch | null> {
    return this.branchRepository.findOne({
      where: { branchCode },
    });
  }

  async findActive(): Promise<Branch[]> {
    return this.branchRepository.find({
      where: { isActive: true },
      order: { branchName: 'ASC' },
    });
  }

  async create(createDto: Partial<Branch>): Promise<Branch> {
    const branch = this.branchRepository.create(createDto);
    return this.branchRepository.save(branch);
  }

  async update(branchId: string, updateDto: Partial<Branch>): Promise<Branch> {
    await this.branchRepository.update(branchId, updateDto);
    return this.findById(branchId);
  }

  async deactivate(branchId: string): Promise<Branch> {
    await this.branchRepository.update(branchId, { isActive: false });
    return this.findById(branchId);
  }

  async delete(branchId: string): Promise<void> {
    await this.branchRepository.delete(branchId);
  }

  async getStats(): Promise<BranchStats> {
    const [total, active, inactive] = await Promise.all([
      this.branchRepository.count(),
      this.branchRepository.count({ where: { isActive: true } }),
      this.branchRepository.count({ where: { isActive: false } }),
    ]);

    return { total, active, inactive };
  }

  async getOfficers(branchId: string): Promise<any[]> {
    return [];
  }
}
