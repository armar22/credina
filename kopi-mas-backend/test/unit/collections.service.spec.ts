import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionsService } from '../../src/modules/collections/services/collections.service';
import { LoanCollection, CollectionStatus } from '../../src/modules/collections/entities/collection.entity';
import { AuditLogsService } from '../../src/modules/audit-logs/services/audit-logs.service';

describe('CollectionsService', () => {
  let service: CollectionsService;
  let repository: Repository<LoanCollection>;
  let auditService: AuditLogsService;

  const mockCollection: Partial<LoanCollection> = {
    collection_id: '123e4567-e89b-12d3-a456-426614174000',
    applicationId: '123e4567-e89b-12d3-a456-426614174001',
    memberId: '123e4567-e89b-12d3-a456-426614174002',
    disbursementId: '123e4567-e89b-12d3-a456-426614174003',
    installmentNumber: 1,
    dueDate: new Date('2026-04-01'),
    dueAmount: 500000,
    paidAmount: 0,
    collectionStatus: CollectionStatus.PENDING,
  };

  const mockRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getRawOne: jest.fn().mockResolvedValue({ total: '0', collected: '0' }),
    })),
  };

  const mockAuditService = {
    create: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionsService,
        {
          provide: getRepositoryToken(LoanCollection),
          useValue: mockRepository,
        },
        {
          provide: AuditLogsService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<CollectionsService>(CollectionsService);
    repository = module.get<Repository<LoanCollection>>(getRepositoryToken(LoanCollection));
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated collections', async () => {
      const collections = [mockCollection];
      mockRepository.findAndCount.mockResolvedValue([collections, 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(collections);
      expect(result.total).toBe(1);
    });

    it('should filter by status', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockCollection], 1]);

      await service.findAll({ status: ['pending'] });

      expect(mockRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return collection statistics', async () => {
      mockRepository.count
        .mockResolvedValueOnce(10) // pending
        .mockResolvedValueOnce(5)  // paid
        .mockResolvedValueOnce(2); // overdue

      const result = await service.getStats();

      expect(result.totalPending).toBe(10);
      expect(result.totalPaid).toBe(5);
      expect(result.totalOverdue).toBe(2);
    });
  });

  describe('recordPayment', () => {
    it('should record a payment for a collection', async () => {
      mockRepository.findOne.mockResolvedValue(mockCollection);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce({
        ...mockCollection,
        paidAmount: 500000,
        collectionStatus: CollectionStatus.PAID,
      });

      const result = await service.recordPayment(
        mockCollection.collection_id,
        500000,
        'officer-id',
        'user-id',
        'user@example.com',
      );

      expect(mockRepository.update).toHaveBeenCalled();
      expect(mockAuditService.create).toHaveBeenCalled();
    });

    it('should throw error if collection not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.recordPayment('nonexistent', 500000),
      ).rejects.toThrow('Collection not found');
    });
  });

  describe('findOverdue', () => {
    it('should return overdue collections', async () => {
      const overdueCollections = [{ ...mockCollection, collectionStatus: CollectionStatus.OVERDUE }];
      
      mockRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(overdueCollections),
      });

      const result = await service.findOverdue();

      expect(result).toEqual(overdueCollections);
    });
  });

  describe('getPaymentStats', () => {
    it('should return payment statistics', async () => {
      mockRepository.createQueryBuilder
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ total: '1000000' }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ total: '100000' }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ total: '500000' }),
        });

      mockRepository.count.mockResolvedValue(10);

      const result = await service.getPaymentStats();

      expect(result.totalCollected).toBe(1000000);
    });
  });
});
