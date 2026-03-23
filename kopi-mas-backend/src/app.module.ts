import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import configuration from './config/configuration';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MembersModule } from './modules/members/members.module';
import { LoanApplicationsModule } from './modules/loan-applications/loan-applications.module';
import { LoanDocumentsModule } from './modules/loan-documents/loan-documents.module';
import { FieldVerificationsModule } from './modules/field-verifications/field-verifications.module';
import { DisbursementsModule } from './modules/disbursements/disbursements.module';
import { LoanProductsModule } from './modules/loan-products/loan-products.module';
import { BranchesModule } from './modules/branches/branches.module';
import { RegionsModule } from './modules/regions/regions.module';
import { ReportsModule } from './modules/reports/reports.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { InstallmentsModule } from './modules/installments/installments.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UploadModule } from './modules/upload/upload.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AgentsModule } from './modules/agents/agents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn'),
        },
      }),
    }),
    UsersModule,
    AuthModule,
    MembersModule,
    LoanApplicationsModule,
    LoanDocumentsModule,
    FieldVerificationsModule,
    DisbursementsModule,
    LoanProductsModule,
    BranchesModule,
    RegionsModule,
    ReportsModule,
    DashboardModule,
    CollectionsModule,
    InstallmentsModule,
    IntegrationsModule,
    AuditLogsModule,
    NotificationsModule,
    UploadModule,
    PaymentsModule,
    AgentsModule,
  ],
})
export class AppModule {}
