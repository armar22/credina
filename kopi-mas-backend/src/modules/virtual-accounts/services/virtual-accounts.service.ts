import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VirtualAccount } from '../entities/virtual-account.entity';

@Injectable()
export class VirtualAccountsService {
  constructor(
    @InjectRepository(VirtualAccount)
    private vaRepository: Repository<VirtualAccount>,
  ) {}

  async findAll(filters?: {
    memberId?: string;
    isActive?: boolean;
  }): Promise<VirtualAccount[]> {
    const where: any = {};
    if (filters?.memberId) where.memberId = filters.memberId;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    return this.vaRepository.find({ where });
  }

  async findById(vaId: string): Promise<VirtualAccount | null> {
    return this.vaRepository.findOne({ where: { va_id: vaId } });
  }

  async findByVaNumber(vaNumber: string): Promise<VirtualAccount | null> {
    return this.vaRepository.findOne({ where: { vaNumber } });
  }

  async findByMemberId(memberId: string): Promise<VirtualAccount[]> {
    return this.vaRepository.find({ where: { memberId } });
  }

  async create(createDto: Partial<VirtualAccount>): Promise<VirtualAccount> {
    const va = this.vaRepository.create(createDto);
    return this.vaRepository.save(va);
  }

  async deactivate(vaId: string): Promise<VirtualAccount> {
    await this.vaRepository.update(vaId, { isActive: false });
    return this.findById(vaId);
  }

  async delete(vaId: string): Promise<void> {
    await this.vaRepository.delete(vaId);
  }
}
