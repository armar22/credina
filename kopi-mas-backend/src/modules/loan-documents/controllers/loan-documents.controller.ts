import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanDocument, DocumentType } from '../entities/loan-document.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Controller('api/v1/loan-documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoanDocumentsController {
  constructor(
    @InjectRepository(LoanDocument)
    private documentRepository: Repository<LoanDocument>,
  ) {}

  @Get()
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('application_id') applicationId?: string,
    @Query('member_id') memberId?: string,
  ) {
    const where: any = {};
    if (applicationId) {
      where.applicationId = applicationId;
    }
    if (memberId) {
      where.memberId = memberId;
    }

    const [data, total] = await this.documentRepository.findAndCount({
      where,
      skip: ((page || 1) - 1) * (limit || 20),
      take: limit || 20,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  @Get(':document_id')
  @Roles(UserRole.OFFICER, UserRole.ADMIN)
  async findOne(@Param('document_id') documentId: string) {
    return this.documentRepository.findOne({ where: { document_id: documentId } });
  }
}

@Controller('api/v1/loan-applications/:application_id/documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationDocumentsController {
  constructor(
    @InjectRepository(LoanDocument)
    private documentRepository: Repository<LoanDocument>,
  ) {}

  @Post()
  @Roles(UserRole.OFFICER)
  async create(
    @Param('application_id') applicationId: string,
    @Body() createDto: { documentType: string; fileUrl: string; fileName: string; uploadedByOfficerId: string; memberId?: string },
  ) {
    const document = this.documentRepository.create({
      ...createDto,
      documentType: createDto.documentType as DocumentType,
      applicationId,
      captureTimestamp: new Date(),
    });
    return this.documentRepository.save(document);
  }

  @Get()
  @Roles(UserRole.OFFICER, UserRole.ADMIN)
  async findAll(@Param('application_id') applicationId: string) {
    return this.documentRepository.find({ where: { applicationId } });
  }
}
