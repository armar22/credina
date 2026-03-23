import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberHelpersService } from '../../src/modules/members/services/member-helpers.service';
import { Member, MemberStatus, Gender } from '../../src/modules/members/entities/member.entity';

describe('MemberHelpersService', () => {
  let service: MemberHelpersService;
  let repository: Repository<Member>;

  const mockMember: Partial<Member> = {
    member_id: '123e4567-e89b-12d3-a456-426614174000',
    nik: '1234567890123456',
    name: 'John Doe',
    dob: new Date('1990-01-01'),
    gender: Gender.MALE,
    phone: '081234567890',
    email: 'john@example.com',
    address: 'Jl. Test No. 123',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    postalCode: '12345',
    photoUrl: 'https://example.com/photo.jpg',
    ktpImageUrl: 'https://example.com/ktp.jpg',
    registrationDate: new Date(),
    status: MemberStatus.ACTIVE,
    createdByOfficerId: '123e4567-e89b-12d3-a456-426614174001',
  };

  const mockRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberHelpersService,
        {
          provide: getRepositoryToken(Member),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MemberHelpersService>(MemberHelpersService);
    repository = module.get<Repository<Member>>(getRepositoryToken(Member));
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find a member by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockMember);
      const result = await service.findById(mockMember.member_id);
      expect(result).toEqual(mockMember);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { member_id: mockMember.member_id } });
    });

    it('should return null if member not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.findById('nonexistent-id');
      expect(result).toBeNull();
    });
  });

  describe('findByNik', () => {
    it('should find a member by NIK', async () => {
      mockRepository.findOne.mockResolvedValue(mockMember);
      const result = await service.findByNik('1234567890123456');
      expect(result).toEqual(mockMember);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { nik: '1234567890123456' } });
    });
  });

  describe('findByPhone', () => {
    it('should find a member by phone', async () => {
      mockRepository.findOne.mockResolvedValue(mockMember);
      const result = await service.findByPhone('081234567890');
      expect(result).toEqual(mockMember);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { phone: '081234567890' } });
    });
  });

  describe('findAll', () => {
    it('should return paginated members', async () => {
      const members = [mockMember];
      mockRepository.findAndCount.mockResolvedValue([members, 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(members);
      expect(result.total).toBe(1);
      expect(mockRepository.findAndCount).toHaveBeenCalled();
    });

    it('should filter by status', async () => {
      const members = [mockMember];
      mockRepository.findAndCount.mockResolvedValue([members, 1]);

      await service.findAll({ status: 'active' });

      expect(mockRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new member', async () => {
      mockRepository.create.mockReturnValue(mockMember);
      mockRepository.save.mockResolvedValue(mockMember);

      const result = await service.create(mockMember as Member);

      expect(mockRepository.create).toHaveBeenCalledWith(mockMember);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockMember);
    });
  });

  describe('update', () => {
    it('should update a member', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue({ ...mockMember, name: 'Updated Name' });

      const result = await service.update(mockMember.member_id, { name: 'Updated Name' });

      expect(mockRepository.update).toHaveBeenCalledWith(mockMember.member_id, { name: 'Updated Name' });
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('delete', () => {
    it('should delete a member', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(mockMember.member_id);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockMember.member_id);
    });
  });
});
