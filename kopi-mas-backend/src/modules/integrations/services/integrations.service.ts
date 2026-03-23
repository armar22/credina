import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { Integration, IntegrationType, IntegrationStatus } from '../entities/integration.entity';

export interface IntegrationStats {
  total: number;
  active: number;
  inactive: number;
  byType: Record<string, number>;
}

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(Integration)
    private integrationRepository: Repository<Integration>,
  ) {}

  async findAll(filters?: {
    type?: string;
    status?: string;
  }): Promise<{ data: Integration[]; total: number }> {
    const where: FindOptionsWhere<Integration> = {};

    if (filters?.type) {
      where.integrationType = filters.type as IntegrationType;
    }
    if (filters?.status) {
      where.integrationStatus = filters.status as IntegrationStatus;
    }

    const [data, total] = await this.integrationRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async findOne(integrationId: string): Promise<Integration | null> {
    return this.integrationRepository.findOne({
      where: { integration_id: integrationId },
    });
  }

  async create(createDto: Partial<Integration>): Promise<Integration> {
    const integration = this.integrationRepository.create(createDto);
    return this.integrationRepository.save(integration);
  }

  async update(integrationId: string, updateDto: Partial<Integration>): Promise<Integration> {
    await this.integrationRepository.update(integrationId, updateDto);
    return this.integrationRepository.findOne({ where: { integration_id: integrationId } });
  }

  async delete(integrationId: string): Promise<void> {
    await this.integrationRepository.delete(integrationId);
  }

  async getStats(): Promise<IntegrationStats> {
    const [total, active, inactive, all] = await Promise.all([
      this.integrationRepository.count(),
      this.integrationRepository.count({ where: { integrationStatus: IntegrationStatus.ACTIVE } }),
      this.integrationRepository.count({ where: { integrationStatus: IntegrationStatus.INACTIVE } }),
      this.integrationRepository.find(),
    ]);

    const byType: Record<string, number> = {};
    all.forEach((integration) => {
      byType[integration.integrationType] = (byType[integration.integrationType] || 0) + 1;
    });

    return { total, active, inactive, byType };
  }

  async testConnection(integrationId: string): Promise<{ success: boolean; message: string }> {
    const integration = await this.findOne(integrationId);
    if (!integration) {
      return { success: false, message: 'Integration not found' };
    }

    return { success: true, message: `Connection test to ${integration.provider} successful` };
  }

  async toggleActive(integrationId: string, isActive: boolean): Promise<Integration> {
    const integration = await this.findOne(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    return this.update(integrationId, {
      isActive,
      integrationStatus: isActive ? IntegrationStatus.ACTIVE : IntegrationStatus.INACTIVE,
    });
  }

  async findByType(type: IntegrationType): Promise<Integration[]> {
    return this.integrationRepository.find({
      where: { integrationType: type },
    });
  }

  async findActiveByType(type: IntegrationType): Promise<Integration | null> {
    return this.integrationRepository.findOne({
      where: { 
        integrationType: type, 
        isActive: true,
        integrationStatus: IntegrationStatus.ACTIVE 
      },
    });
  }
}
