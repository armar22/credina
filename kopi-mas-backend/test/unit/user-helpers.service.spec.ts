import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserHelpersService } from '../../src/modules/users/services/user-helpers.service';
import { User, UserRole } from '../../src/modules/users/entities/user.entity';
import * as bcrypt from 'bcryptjs';

describe('UserHelpersService', () => {
  let service: UserHelpersService;
  let repository: Repository<User>;

  const mockUser: Partial<User> = {
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    username: 'testuser',
    passwordHash: 'hashedpassword',
    role: UserRole.ADMIN,
    fullName: 'Test User',
    phone: '1234567890',
    isActive: true,
  };

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserHelpersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserHelpersService>(UserHelpersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findById(mockUser.user_id);
      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { user_id: mockUser.user_id } });
    });

    it('should return null if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.findById('nonexistent-id');
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });
  });

  describe('findByUsername', () => {
    it('should find a user by username', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findByUsername('testuser');
      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });
    });
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockRepository.create.mockReturnValue({ ...mockUser, passwordHash: hashedPassword });
      mockRepository.save.mockResolvedValue({ ...mockUser, passwordHash: hashedPassword });

      const result = await service.create(mockUser as User, 'password123');
      
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.passwordHash).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue({ ...mockUser, fullName: 'Updated Name' });

      const result = await service.update(mockUser.user_id, { fullName: 'Updated Name' });
      
      expect(mockRepository.update).toHaveBeenCalledWith(mockUser.user_id, { fullName: 'Updated Name' });
      expect(result.fullName).toBe('Updated Name');
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });
      
      await service.delete(mockUser.user_id);
      
      expect(mockRepository.delete).toHaveBeenCalledWith(mockUser.user_id);
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userWithHash = { ...mockUser, passwordHash: hashedPassword };
      
      const result = await service.validatePassword(userWithHash as User, 'password123');
      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userWithHash = { ...mockUser, passwordHash: hashedPassword };
      
      const result = await service.validatePassword(userWithHash as User, 'wrongpassword');
      expect(result).toBe(false);
    });
  });
});
