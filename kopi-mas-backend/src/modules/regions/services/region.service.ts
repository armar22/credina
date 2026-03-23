import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from '../entities/region.entity';
import { Branch } from '../../branches/entities/branch.entity';

export interface RegionWithBranchCount extends Region {
  branchCount?: number;
}

export interface RegionStats {
  total: number;
}

@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(Region)
    private regionRepository: Repository<Region>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
  ) {}

  async findAll(filters?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: RegionWithBranchCount[]; total: number }> {
    const [data, total] = await this.regionRepository.findAndCount({
      skip: ((filters?.page || 1) - 1) * (filters?.limit || 10),
      take: filters?.limit || 10,
      order: { regionName: 'ASC' },
    });

    const regionsWithCount: RegionWithBranchCount[] = await Promise.all(
      data.map(async (region) => {
        const branchCount = await this.branchRepository
          .createQueryBuilder('branch')
          .where('branch.region_id = :regionId', { regionId: region.region_id })
          .getCount();
        
        return {
          ...region,
          branchCount,
        } as RegionWithBranchCount;
      })
    );

    return { data: regionsWithCount, total };
  }

  async findById(regionId: string): Promise<Region | null> {
    return this.regionRepository.findOne({
      where: { region_id: regionId },
    });
  }

  async findByCode(regionCode: string): Promise<Region | null> {
    return this.regionRepository.findOne({
      where: { regionCode },
    });
  }

  async create(createDto: Partial<Region>): Promise<Region> {
    const region = this.regionRepository.create(createDto);
    return this.regionRepository.save(region);
  }

  async update(regionId: string, updateDto: Partial<Region>): Promise<Region> {
    await this.regionRepository.update(regionId, updateDto);
    return this.findById(regionId);
  }

  async delete(regionId: string): Promise<void> {
    const branchesCount = await this.branchRepository
      .createQueryBuilder('branch')
      .where('branch.region_id = :regionId', { regionId })
      .getCount();

    if (branchesCount > 0) {
      throw new BadRequestException(
        `Cannot delete region. There are ${branchesCount} branch(es) attached to this region.`,
      );
    }

    await this.regionRepository.delete(regionId);
  }

  async getStats(): Promise<RegionStats> {
    const total = await this.regionRepository.count();
    return { total };
  }

  async getBranches(regionId: string): Promise<any[]> {
    return this.branchRepository.find({
      where: { regionId: regionId as any },
    });
  }
}
