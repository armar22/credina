import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { LoanDocument, DocumentType } from '../entities/loan-document.entity';

export interface DocumentStats {
  total: number;
  byType: Record<string, number>;
}

@Injectable()
export class LoanDocumentsService {
  constructor(
    @InjectRepository(LoanDocument)
    private documentRepository: Repository<LoanDocument>,
  ) {}

  async findAll(filters?: {
    applicationId?: string;
    documentType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: LoanDocument[]; total: number }> {
    const where: FindOptionsWhere<LoanDocument> = {};

    if (filters?.applicationId) {
      where.applicationId = filters.applicationId as any;
    }
    if (filters?.documentType) {
      where.documentType = filters.documentType as DocumentType;
    }

    const [data, total] = await this.documentRepository.findAndCount({
      where,
      skip: ((filters?.page || 1) - 1) * (filters?.limit || 10),
      take: filters?.limit || 10,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async findById(documentId: string): Promise<LoanDocument | null> {
    return this.documentRepository.findOne({
      where: { document_id: documentId },
    });
  }

  async findByApplicationId(applicationId: string): Promise<LoanDocument[]> {
    return this.documentRepository.find({
      where: { applicationId: applicationId as any },
      order: { createdAt: 'DESC' },
    });
  }

  async create(createDto: Partial<LoanDocument>): Promise<LoanDocument> {
    const document = this.documentRepository.create({
      ...createDto,
      captureTimestamp: new Date(),
    });
    return this.documentRepository.save(document);
  }

  async update(documentId: string, updateDto: Partial<LoanDocument>): Promise<LoanDocument> {
    await this.documentRepository.update(documentId, updateDto);
    return this.findById(documentId);
  }

  async delete(documentId: string): Promise<void> {
    await this.documentRepository.delete(documentId);
  }

  async getStats(): Promise<DocumentStats> {
    const all = await this.documentRepository.find();
    const byType: Record<string, number> = {};

    all.forEach((doc) => {
      byType[doc.documentType] = (byType[doc.documentType] || 0) + 1;
    });

    return {
      total: all.length,
      byType,
    };
  }
}
