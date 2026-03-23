import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { LoanProduct, ProductType } from '../entities/loan-product.entity';

@Injectable()
export class LoanProductsService {
  constructor(
    @InjectRepository(LoanProduct)
    private productRepository: Repository<LoanProduct>,
  ) {}

  async findAll(filters?: {
    productType?: string;
    branchId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: LoanProduct[]; total: number }> {
    const where: FindOptionsWhere<LoanProduct> = {};

    if (filters?.productType) {
      where.productType = filters.productType as ProductType;
    }
    if (filters?.branchId) {
      where.branchId = filters.branchId as any;
    }
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [data, total] = await this.productRepository.findAndCount({
      where,
      skip: ((filters?.page || 1) - 1) * (filters?.limit || 10),
      take: filters?.limit || 10,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async findById(productId: string): Promise<LoanProduct | null> {
    return this.productRepository.findOne({
      where: { product_id: productId },
    });
  }

  async findActive(): Promise<LoanProduct[]> {
    return this.productRepository.find({
      where: { isActive: true },
      order: { productName: 'ASC' },
    });
  }

  async create(createDto: Partial<LoanProduct>): Promise<LoanProduct> {
    const product = this.productRepository.create(createDto);
    return this.productRepository.save(product);
  }

  async update(productId: string, updateDto: Partial<LoanProduct>): Promise<LoanProduct> {
    await this.productRepository.update(productId, updateDto);
    return this.findById(productId);
  }

  async deactivate(productId: string): Promise<LoanProduct> {
    await this.productRepository.update(productId, { isActive: false });
    return this.findById(productId);
  }

  async delete(productId: string): Promise<void> {
    await this.productRepository.delete(productId);
  }

  async createNewVersion(productId: string): Promise<LoanProduct> {
    const existing = await this.findById(productId);
    if (!existing) {
      throw new Error('Product not found');
    }

    const newVersion = this.productRepository.create({
      ...existing,
      product_id: undefined,
      version: existing.version + 1,
      previousVersionId: productId,
      isActive: true,
    });

    await this.productRepository.update(productId, { isActive: false });

    return this.productRepository.save(newVersion);
  }

  async getVersions(productId: string): Promise<LoanProduct[]> {
    return this.productRepository.find({
      where: [
        { product_id: productId } as any,
        { previousVersionId: productId } as any,
      ],
      order: { version: 'DESC' },
    });
  }
}
