import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanProduct, ProductType, ProductInterestRateType } from '../entities/loan-product.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { AuditLogsService } from '../../audit-logs/services/audit-logs.service';
import { AuditAction } from '../../audit-logs/entities/audit-log.entity';

@Controller('api/v1/loan-products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoanProductsController {
  constructor(
    @InjectRepository(LoanProduct)
    private productRepository: Repository<LoanProduct>,
    private auditLogsService: AuditLogsService,
  ) {}

  @Get()
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findAll() {
    return this.productRepository.find({ where: { isActive: true } });
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async create(@Body() createDto: any, @Req() req: any) {
    const user = req.user;
    const product = this.productRepository.create({
      ...createDto,
      productType: createDto.productType as ProductType,
      interestRateType: createDto.interestRateType as ProductInterestRateType,
    });
    const saved = await this.productRepository.save(product) as unknown as LoanProduct;
    
    await this.auditLogsService.create({
      action: AuditAction.CREATE,
      userId: user?.user_id,
      userEmail: user?.email,
      entityType: 'LoanProduct',
      entityId: saved.product_id,
      newValues: { name: saved.productName, type: saved.productType },
      description: `Created loan product: ${saved.productName}`,
    });
    
    return saved;
  }

  @Patch(':product_id')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async update(@Param('product_id') productId: string, @Body() updateDto: any, @Req() req: any) {
    const user = req.user;
    const oldProduct = await this.productRepository.findOne({ where: { product_id: productId } });
    
    const updateData: any = { ...updateDto };
    
    if (updateDto.productType) {
      updateData.productType = updateDto.productType as ProductType;
    }
    if (updateDto.interestRateType) {
      updateData.interestRateType = updateDto.interestRateType as ProductInterestRateType;
    }
    
    await this.productRepository.update(productId, updateData);
    const updated = await this.productRepository.findOne({ where: { product_id: productId } }) as unknown as LoanProduct;
    
    await this.auditLogsService.create({
      action: AuditAction.UPDATE,
      userId: user?.user_id,
      userEmail: user?.email,
      entityType: 'LoanProduct',
      entityId: productId,
      oldValues: { name: oldProduct?.productName },
      newValues: { name: updated?.productName },
      description: `Updated loan product: ${updated?.productName}`,
    });
    
    return updated;
  }

  @Delete(':product_id')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async remove(@Param('product_id') productId: string, @Req() req: any) {
    const user = req.user;
    const product = await this.productRepository.findOne({ where: { product_id: productId } });
    await this.productRepository.delete(productId);
    
    await this.auditLogsService.create({
      action: AuditAction.DELETE,
      userId: user?.user_id,
      userEmail: user?.email,
      entityType: 'LoanProduct',
      entityId: productId,
      oldValues: { name: product?.productName },
      description: `Deleted loan product: ${product?.productName}`,
    });
    
    return { message: 'Product deleted successfully', success: true };
  }
}
