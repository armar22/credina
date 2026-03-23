import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Region } from './modules/regions/entities/region.entity';
import { Branch } from './modules/branches/entities/branch.entity';
import { User, UserRole } from './modules/users/entities/user.entity';
import { LoanProduct, ProductType, ProductInterestRateType } from './modules/loan-products/entities/loan-product.entity';
import { Member, MemberStatus, Gender } from './modules/members/entities/member.entity';
import { LoanApplication, ApplicationStatus, LoanProductType, InterestRateType, IncomeSource } from './modules/loan-applications/entities/loan-application.entity';
import { LoanDisbursement, TransferStatus } from './modules/disbursements/entities/disbursement.entity';
import { LoanInstallment, InstallmentStatus } from './modules/installments/entities/installment.entity';
import { LoanCollection, CollectionStatus } from './modules/collections/entities/collection.entity';
import { FieldVerification, VerificationStatus } from './modules/field-verifications/entities/field-verification.entity';
import { LoanDocument, DocumentType } from './modules/loan-documents/entities/loan-document.entity';
import { VirtualAccount } from './modules/virtual-accounts/entities/virtual-account.entity';
import { Notification, NotificationType, NotificationPriority } from './modules/notifications/entities/notification.entity';
import { Integration, IntegrationType, IntegrationStatus } from './modules/integrations/entities/integration.entity';
import { Payment, PaymentMethod, PaymentStatus } from './modules/payments/entities/payment.entity';
import { Agent, AgentStatus } from './modules/agents/entities/agent.entity';
import { AgentWalletTransaction, TransactionType, TransactionStatus } from './modules/agents/entities/agent-wallet.entity';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('Starting comprehensive database seeding...\n');

  // Clear existing data to avoid conflicts
  console.log('Clearing existing data...');
  
  // Delete in correct order (child tables first) to avoid FK conflicts
  // Using createQueryBuilder().delete() to avoid empty criteria issue
  await dataSource.getRepository(LoanCollection).createQueryBuilder().delete().execute();
  await dataSource.getRepository(LoanInstallment).createQueryBuilder().delete().execute();
  await dataSource.getRepository(LoanDisbursement).createQueryBuilder().delete().execute();
  await dataSource.getRepository(Payment).createQueryBuilder().delete().execute();
  await dataSource.getRepository(LoanApplication).createQueryBuilder().delete().execute();
  await dataSource.getRepository(FieldVerification).createQueryBuilder().delete().execute();
  await dataSource.getRepository(LoanDocument).createQueryBuilder().delete().execute();
  await dataSource.getRepository(VirtualAccount).createQueryBuilder().delete().execute();
  await dataSource.getRepository(Notification).createQueryBuilder().delete().execute();
  await dataSource.getRepository(Integration).createQueryBuilder().delete().execute();
  await dataSource.getRepository(Member).createQueryBuilder().delete().execute();
  await dataSource.getRepository(LoanProduct).createQueryBuilder().delete().execute();
  await dataSource.getRepository(AgentWalletTransaction).createQueryBuilder().delete().execute();
  await dataSource.getRepository(Agent).createQueryBuilder().delete().execute();
  await dataSource.getRepository(User).createQueryBuilder().delete().execute();
  await dataSource.getRepository(Branch).createQueryBuilder().delete().execute();
  await dataSource.getRepository(Region).createQueryBuilder().delete().execute();
  
  console.log('✓ Existing data cleared\n');

  try {
    // ==================== REGIONS ====================
    console.log('Seeding Regions...');
    
    const regions = [
      { regionCode: 'JABAR', regionName: 'Jawa Barat' },
      { regionCode: 'JATENG', regionName: 'Jawa Tengah' },
      { regionCode: 'JATIM', regionName: 'Jawa Timur' },
      { regionCode: 'SUMATERA', regionName: 'Sumatera' },
      { regionCode: 'KALIMANTAN', regionName: 'Kalimantan' },
    ];

    const savedRegions: Region[] = await dataSource.getRepository(Region).save(regions);
    console.log(`✓ Created ${savedRegions.length} regions\n`);

    // ==================== BRANCHES ====================
    console.log('Seeding Branches...');
    
    const branches = [
      { branchCode: 'JKT001', branchName: 'Kopi Mas Jakarta Pusat', regionId: savedRegions[0].region_id, address: 'Jl. Sudirman No. 123', city: 'Jakarta Pusat', province: 'DKI Jakarta', phone: '0211234567', isActive: true },
      { branchCode: 'JKT002', branchName: 'Kopi Mas Jakarta Selatan', regionId: savedRegions[0].region_id, address: 'Jl. Thamrin No. 45', city: 'Jakarta Selatan', province: 'DKI Jakarta', phone: '0217654321', isActive: true },
      { branchCode: 'BDG001', branchName: 'Kopi Mas Bandung', regionId: savedRegions[0].region_id, address: 'Jl. Braga No. 78', city: 'Bandung', province: 'Jawa Barat', phone: '0221234567', isActive: true },
      { branchCode: 'SBY001', branchName: 'Kopi Mas Surabaya', regionId: savedRegions[2].region_id, address: 'Jl. Basuki Rahmat No. 90', city: 'Surabaya', province: 'Jawa Timur', phone: '0311234567', isActive: true },
      { branchCode: 'SMG001', branchName: 'Kopi Mas Semarang', regionId: savedRegions[1].region_id, address: 'Jl. Ahmad Yani No. 112', city: 'Semarang', province: 'Jawa Tengah', phone: '0241234567', isActive: true },
      { branchCode: 'MEDAN01', branchName: 'Kopi Mas Medan', regionId: savedRegions[3].region_id, address: 'Jl. Diponegoro No. 34', city: 'Medan', province: 'Sumatera Utara', phone: '0611234567', isActive: true },
      { branchCode: 'PLKB01', branchName: 'Kopi Mas Palembang', regionId: savedRegions[3].region_id, address: 'Jl. Rimba Squrai No. 56', city: 'Palembang', province: 'Sumatera Selatan', phone: '0711234567', isActive: true },
      { branchCode: 'BJP001', branchName: 'Kopi Mas Balikpapan', regionId: savedRegions[4].region_id, address: 'Jl. Sudirman No. 89', city: 'Balikpapan', province: 'Kalimantan Timur', phone: '05421234567', isActive: true },
    ];

    const savedBranches: Branch[] = await dataSource.getRepository(Branch).save(branches);
    console.log(`✓ Created ${savedBranches.length} branches\n`);

    // ==================== USERS ====================
    console.log('Seeding Users...');
    
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const users = [
      { username: 'admin', email: 'admin@kopimas.com', passwordHash, role: UserRole.SYSTEM_ADMIN, fullName: 'Super Admin', phone: '081234567890', isActive: true },
      { username: 'admin_jabar', email: 'admin.jabar@kopimas.com', passwordHash, role: UserRole.ADMIN, fullName: 'Ahmad Jaya', phone: '081234567891', branchId: savedBranches[0].branch_id, regionId: savedRegions[0].region_id, isActive: true },
      { username: 'admin_jateng', email: 'admin.jateng@kopimas.com', passwordHash, role: UserRole.ADMIN, fullName: 'Budi Santoso', phone: '081234567892', branchId: savedBranches[4].branch_id, regionId: savedRegions[1].region_id, isActive: true },
      { username: 'admin_jatim', email: 'admin.jatim@kopimas.com', passwordHash, role: UserRole.ADMIN, fullName: 'Citra Dewi', phone: '081234567893', branchId: savedBranches[3].branch_id, regionId: savedRegions[2].region_id, isActive: true },
      { username: 'officer_jkt1', email: 'officer.jkt1@kopimas.com', passwordHash, role: UserRole.OFFICER, fullName: 'Dedi Kurniawan', phone: '081234567894', branchId: savedBranches[0].branch_id, officerId: 'OFF001', isActive: true },
      { username: 'officer_jkt2', email: 'officer.jkt2@kopimas.com', passwordHash, role: UserRole.OFFICER, fullName: 'Eka Putri', phone: '081234567895', branchId: savedBranches[1].branch_id, officerId: 'OFF002', isActive: true },
      { username: 'officer_bdg', email: 'officer.bdg@kopimas.com', passwordHash, role: UserRole.OFFICER, fullName: 'Fajar Rahman', phone: '081234567896', branchId: savedBranches[2].branch_id, officerId: 'OFF003', isActive: true },
      { username: 'officer_sby', email: 'officer.sby@kopimas.com', passwordHash, role: UserRole.OFFICER, fullName: 'Galih Pratama', phone: '081234567897', branchId: savedBranches[3].branch_id, officerId: 'OFF004', isActive: true },
      { username: 'officer_smg', email: 'officer.smg@kopimas.com', passwordHash, role: UserRole.OFFICER, fullName: 'Hendra Wijaya', phone: '081234567898', branchId: savedBranches[4].branch_id, officerId: 'OFF005', isActive: true },
      { username: 'supervisor', email: 'supervisor@kopimas.com', passwordHash, role: UserRole.SUPERVISOR, fullName: 'Iwan Susanto', phone: '081234567899', branchId: savedBranches[0].branch_id, isActive: true },
    ];

    const savedUsers: User[] = await dataSource.getRepository(User).save(users);
    console.log(`✓ Created ${savedUsers.length} users\n`); 

    // ==================== AGENTS ====================
    console.log('Seeding Agents...');
    
    const agents = [
      { 
        agentCode: 'AGT001', 
        fullName: 'Rudi Hermawan', 
        phoneNumber: '08123456021', 
        email: 'rudi.hermawan@kopimas.com',
        address: 'Jl. Merdeka No. 15, Jakarta Pusat',
        idCardNumber: '3174010101010021',
        status: AgentStatus.ACTIVE,
        selfApprovalLimit: 5000000,
        pettyCashBalance: 10000000,
        collectionBalance: 5000000,
        branchId: savedBranches[0].branch_id,
        regionId: savedRegions[0].region_id,
        userId: savedUsers[4].user_id,
      },
      { 
        agentCode: 'AGT002', 
        fullName: 'Sari Dewi', 
        phoneNumber: '08123456022', 
        email: 'sari.dewi@kopimas.com',
        address: 'Jl. Thamrin No. 25, Jakarta Selatan',
        idCardNumber: '3174010101010022',
        status: AgentStatus.ACTIVE,
        selfApprovalLimit: 3000000,
        pettyCashBalance: 7500000,
        collectionBalance: 2500000,
        branchId: savedBranches[1].branch_id,
        regionId: savedRegions[0].region_id,
        userId: savedUsers[5].user_id,
      },
      { 
        agentCode: 'AGT003', 
        fullName: 'Toni Suhartono', 
        phoneNumber: '08123456023', 
        email: 'toni.suhartono@kopimas.com',
        address: 'Jl. Braga No. 45, Bandung',
        idCardNumber: '3273010101010023',
        status: AgentStatus.ACTIVE,
        selfApprovalLimit: 5000000,
        pettyCashBalance: 15000000,
        collectionBalance: 8000000,
        branchId: savedBranches[2].branch_id,
        regionId: savedRegions[0].region_id,
        userId: savedUsers[6].user_id,
      },
      { 
        agentCode: 'AGT004', 
        fullName: 'Wati Kusuma', 
        phoneNumber: '08123456024', 
        email: 'wati.kusuma@kopimas.com',
        address: 'Jl. Basuki Rahmat No. 55, Surabaya',
        idCardNumber: '3578010101010024',
        status: AgentStatus.ACTIVE,
        selfApprovalLimit: 4000000,
        pettyCashBalance: 8000000,
        collectionBalance: 3000000,
        branchId: savedBranches[3].branch_id,
        regionId: savedRegions[2].region_id,
        userId: savedUsers[7].user_id,
      },
      { 
        agentCode: 'AGT005', 
        fullName: 'Bambang Prasetyo', 
        phoneNumber: '08123456025', 
        email: 'bambang.prasetyo@kopimas.com',
        address: 'Jl. Ahmad Yani No. 88, Semarang',
        idCardNumber: '3374010101010025',
        status: AgentStatus.INACTIVE,
        selfApprovalLimit: 2000000,
        pettyCashBalance: 0,
        collectionBalance: 0,
        branchId: savedBranches[4].branch_id,
        regionId: savedRegions[1].region_id,
      },
    ];

    const savedAgents: Agent[] = await dataSource.getRepository(Agent).save(agents);
    console.log(`✓ Created ${savedAgents.length} agents\n`);

    // ==================== LOAN PRODUCTS ====================
    console.log('Seeding Loan Products...');
    
    const products = [
      { 
        productName: 'Kopi Personal Micro', 
        productType: ProductType.PERSONAL, 
        minAmount: 500000, 
        maxAmount: 5000000, 
        minTenureMonths: 3, 
        maxTenureMonths: 12, 
        interestRateType: ProductInterestRateType.FIXED, 
        interestRateMin: 1.5, 
        interestRateMax: 2.0,
        branchId: savedBranches[0].branch_id,
        isActive: true 
      },
      { 
        productName: 'Kopi Personal Standard', 
        productType: ProductType.PERSONAL, 
        minAmount: 5000000, 
        maxAmount: 25000000, 
        minTenureMonths: 6, 
        maxTenureMonths: 36, 
        interestRateType: ProductInterestRateType.FIXED, 
        interestRateMin: 1.2, 
        interestRateMax: 1.8,
        branchId: savedBranches[0].branch_id,
        isActive: true 
      },
      { 
        productName: 'Kopi Bisnis Usaha', 
        productType: ProductType.BUSINESS, 
        minAmount: 10000000, 
        maxAmount: 100000000, 
        minTenureMonths: 6, 
        maxTenureMonths: 48, 
        interestRateType: ProductInterestRateType.REDUCING, 
        interestRateMin: 1.0, 
        interestRateMax: 1.5,
        branchId: savedBranches[1].branch_id,
        isActive: true 
      },
      { 
        productName: 'Kopi Bisnis Mikro', 
        productType: ProductType.BUSINESS, 
        minAmount: 3000000, 
        maxAmount: 15000000, 
        minTenureMonths: 3, 
        maxTenureMonths: 24, 
        interestRateType: ProductInterestRateType.FIXED, 
        interestRateMin: 1.3, 
        interestRateMax: 1.75,
        branchId: savedBranches[2].branch_id,
        isActive: true 
      },
      { 
        productName: 'Kopi Darurat Kesehatan', 
        productType: ProductType.EMERGENCY, 
        minAmount: 1000000, 
        maxAmount: 10000000, 
        minTenureMonths: 1, 
        maxTenureMonths: 12, 
        interestRateType: ProductInterestRateType.FIXED, 
        interestRateMin: 1.0, 
        interestRateMax: 1.5,
        branchId: savedBranches[3].branch_id,
        isActive: true 
      },
      { 
        productName: 'Kopi Darurat Keluarga', 
        productType: ProductType.EMERGENCY, 
        minAmount: 500000, 
        maxAmount: 5000000, 
        minTenureMonths: 1, 
        maxTenureMonths: 6, 
        interestRateType: ProductInterestRateType.FIXED, 
        interestRateMin: 0.75, 
        interestRateMax: 1.25,
        branchId: savedBranches[0].branch_id,
        isActive: true 
      },
    ];

    const savedProducts: LoanProduct[] = await dataSource.getRepository(LoanProduct).save(products);
    console.log(`✓ Created ${savedProducts.length} loan products\n`);

    // ==================== MEMBERS ====================
    console.log('Seeding Members...');
    
    const members = [
      // Members belong to agents (agent brings in the member)
      { nik: '3174010101010001', name: 'Ahmad Fauzi', dob: new Date('1985-03-15'), gender: Gender.MALE, phone: '08123456001', email: 'ahmad.fauzi@email.com', address: 'Jl. Merdeka No. 10', city: 'Jakarta Pusat', province: 'DKI Jakarta', postalCode: '10110', ktpImageUrl: 'https://example.com/ktp/1.jpg', registrationDate: new Date('2023-01-15'), status: MemberStatus.ACTIVE, branchId: savedBranches[0].branch_id, agentId: savedAgents[0].agent_id, createdByOfficerId: savedUsers[4].user_id },
      { nik: '3174010101010002', name: 'Siti Aminah', dob: new Date('1990-07-22'), gender: Gender.FEMALE, phone: '08123456002', email: 'siti.aminah@email.com', address: 'Jl. Pahlawan No. 25', city: 'Jakarta Selatan', province: 'DKI Jakarta', postalCode: '12110', ktpImageUrl: 'https://example.com/ktp/2.jpg', registrationDate: new Date('2023-02-20'), status: MemberStatus.ACTIVE, branchId: savedBranches[1].branch_id, agentId: savedAgents[1].agent_id, createdByOfficerId: savedUsers[4].user_id },
      { nik: '3273010101010003', name: 'Budi Santoso', dob: new Date('1988-11-05'), gender: Gender.MALE, phone: '08123456003', email: 'budi.s@email.com', address: 'Jl. Asia Afrika No. 50', city: 'Bandung', province: 'Jawa Barat', postalCode: '40111', ktpImageUrl: 'https://example.com/ktp/3.jpg', registrationDate: new Date('2023-03-10'), status: MemberStatus.ACTIVE, branchId: savedBranches[2].branch_id, agentId: savedAgents[2].agent_id, createdByOfficerId: savedUsers[6].user_id },
      { nik: '3578010101010004', name: 'Dewi Lestari', dob: new Date('1992-04-18'), gender: Gender.FEMALE, phone: '08123456004', email: 'dewi.lestari@email.com', address: 'Jl. Basuki Rahmat No. 78', city: 'Surabaya', province: 'Jawa Timur', postalCode: '60271', ktpImageUrl: 'https://example.com/ktp/4.jpg', registrationDate: new Date('2023-04-05'), status: MemberStatus.ACTIVE, branchId: savedBranches[3].branch_id, agentId: savedAgents[3].agent_id, createdByOfficerId: savedUsers[7].user_id },
      { nik: '3374010101010005', name: 'Eko Prasetyo', dob: new Date('1987-09-30'), gender: Gender.MALE, phone: '08123456005', email: 'eko.p@email.com', address: 'Jl. Ahmad Yani No. 120', city: 'Semarang', province: 'Jawa Tengah', postalCode: '50121', ktpImageUrl: 'https://example.com/ktp/5.jpg', registrationDate: new Date('2023-05-12'), status: MemberStatus.ACTIVE, branchId: savedBranches[4].branch_id, agentId: savedAgents[4].agent_id, createdByOfficerId: savedUsers[8].user_id },
      { nik: '1271010101010006', name: 'Fitri Handayani', dob: new Date('1995-12-08'), gender: Gender.FEMALE, phone: '08123456006', email: 'fitri.h@email.com', address: 'Jl. Diponegoro No. 45', city: 'Medan', province: 'Sumatera Utara', postalCode: '20112', ktpImageUrl: 'https://example.com/ktp/6.jpg', registrationDate: new Date('2023-06-18'), status: MemberStatus.ACTIVE, branchId: savedBranches[5].branch_id, agentId: savedAgents[0].agent_id, createdByOfficerId: savedUsers[4].user_id },
      { nik: '1671010101010007', name: 'Gunawan Wibowo', dob: new Date('1983-06-25'), gender: Gender.MALE, phone: '08123456007', email: 'gunawan.w@email.com', address: 'Jl. Rimba Square No. 90', city: 'Palembang', province: 'Sumatera Selatan', postalCode: '30114', ktpImageUrl: 'https://example.com/ktp/7.jpg', registrationDate: new Date('2023-07-22'), status: MemberStatus.ACTIVE, branchId: savedBranches[6].branch_id, agentId: savedAgents[1].agent_id, createdByOfficerId: savedUsers[5].user_id },
      { nik: '6471010101010008', name: 'Hani Susilowati', dob: new Date('1991-01-14'), gender: Gender.FEMALE, phone: '08123456008', email: 'hani.s@email.com', address: 'Jl. Sudirman No. 55', city: 'Balikpapan', province: 'Kalimantan Timur', postalCode: '76111', ktpImageUrl: 'https://example.com/ktp/8.jpg', registrationDate: new Date('2023-08-05'), status: MemberStatus.ACTIVE, branchId: savedBranches[7].branch_id, agentId: savedAgents[2].agent_id, createdByOfficerId: savedUsers[4].user_id },
      { nik: '3174010101010009', name: 'Indra Mahendra', dob: new Date('1989-08-03'), gender: Gender.MALE, phone: '08123456009', email: 'indra.m@email.com', address: 'Jl. Thamrin No. 30', city: 'Jakarta Utara', province: 'DKI Jakarta', postalCode: '14110', ktpImageUrl: 'https://example.com/ktp/9.jpg', registrationDate: new Date('2023-09-10'), status: MemberStatus.ACTIVE, branchId: savedBranches[0].branch_id, agentId: savedAgents[0].agent_id, createdByOfficerId: savedUsers[5].user_id },
      { nik: '3174010101010010', name: 'Jasmine Audrey', dob: new Date('1994-03-27'), gender: Gender.FEMALE, phone: '08123456010', email: 'jasmine.a@email.com', address: 'Jl. Kebon Jeruk No. 15', city: 'Jakarta Barat', province: 'DKI Jakarta', postalCode: '11530', ktpImageUrl: 'https://example.com/ktp/10.jpg', registrationDate: new Date('2023-10-15'), status: MemberStatus.ACTIVE, branchId: savedBranches[1].branch_id, agentId: savedAgents[1].agent_id, createdByOfficerId: savedUsers[5].user_id },
      { nik: '3273010101010011', name: 'Kurnia Rahmat', dob: new Date('1986-10-12'), gender: Gender.MALE, phone: '08123456011', email: 'kurnia.r@email.com', address: 'Jl. Dago No. 88', city: 'Bandung', province: 'Jawa Barat', postalCode: '40135', ktpImageUrl: 'https://example.com/ktp/11.jpg', registrationDate: new Date('2023-11-01'), status: MemberStatus.ACTIVE, branchId: savedBranches[2].branch_id, agentId: savedAgents[2].agent_id, createdByOfficerId: savedUsers[6].user_id },
      { nik: '3578010101010012', name: 'Lina Marlina', dob: new Date('1993-05-19'), gender: Gender.FEMALE, phone: '08123456012', email: 'lina.m@email.com', address: 'Jl. Ngagel No. 42', city: 'Surabaya', province: 'Jawa Timur', postalCode: '60283', ktpImageUrl: 'https://example.com/ktp/12.jpg', registrationDate: new Date('2023-12-08'), status: MemberStatus.ACTIVE, branchId: savedBranches[3].branch_id, agentId: savedAgents[3].agent_id, createdByOfficerId: savedUsers[7].user_id },
      { nik: '3174010101010013', name: 'Muhammad Iqbal', dob: new Date('1990-02-28'), gender: Gender.MALE, phone: '08123456013', email: 'iqbal.m@email.com', address: 'Jl. Cempaka Putih No. 7', city: 'Jakarta Pusat', province: 'DKI Jakarta', postalCode: '10510', ktpImageUrl: 'https://example.com/ktp/13.jpg', registrationDate: new Date('2024-01-05'), status: MemberStatus.ACTIVE, branchId: savedBranches[0].branch_id, agentId: savedAgents[0].agent_id, createdByOfficerId: savedUsers[4].user_id },
      { nik: '3374010101010014', name: 'Nina Hartati', dob: new Date('1988-07-07'), gender: Gender.FEMALE, phone: '08123456014', email: 'nina.h@email.com', address: 'Jl. Pandanaran No. 33', city: 'Semarang', province: 'Jawa Tengah', postalCode: '50134', ktpImageUrl: 'https://example.com/ktp/14.jpg', registrationDate: new Date('2024-02-10'), status: MemberStatus.ACTIVE, branchId: savedBranches[4].branch_id, createdByOfficerId: savedUsers[8].user_id },
      { nik: '3273010101010015', name: 'Oki Fernanda', dob: new Date('1992-11-22'), gender: Gender.MALE, phone: '08123456015', email: 'oki.f@email.com', address: 'Jl. Setiabudi No. 65', city: 'Bandung', province: 'Jawa Barat', postalCode: '40142', ktpImageUrl: 'https://example.com/ktp/15.jpg', registrationDate: new Date('2024-03-15'), status: MemberStatus.ACTIVE, branchId: savedBranches[2].branch_id, createdByOfficerId: savedUsers[6].user_id },
    ];

    const savedMembers: Member[] = await dataSource.getRepository(Member).save(members);
    console.log(`✓ Created ${savedMembers.length} members\n`);

    // ==================== LOAN APPLICATIONS ====================
    console.log('Seeding Loan Applications...');
    
    const applications = [
      // Submitted (with agent)
      { memberId: savedMembers[0].member_id, agentId: savedAgents[0].agent_id, loanProductId: savedProducts[0].product_id, loanProductType: LoanProductType.PERSONAL, loanAmount: 3000000, loanTenureMonths: 6, interestRate: 1.75, interestRateType: InterestRateType.FIXED, incomeSource: IncomeSource.EMPLOYED, monthlyIncome: 8000000, applicationStatus: ApplicationStatus.SUBMITTED, submittedAt: new Date() },
      { memberId: savedMembers[1].member_id, agentId: savedAgents[1].agent_id, loanProductId: savedProducts[2].product_id, loanProductType: LoanProductType.BUSINESS, loanAmount: 15000000, loanTenureMonths: 24, interestRate: 1.25, interestRateType: InterestRateType.REDUCING, incomeSource: IncomeSource.BUSINESS, monthlyIncome: 25000000, applicationStatus: ApplicationStatus.SUBMITTED, submittedAt: new Date() },
      // Under Review
      { memberId: savedMembers[2].member_id, agentId: savedAgents[2].agent_id, loanProductId: savedProducts[1].product_id, loanProductType: LoanProductType.PERSONAL, loanAmount: 10000000, loanTenureMonths: 18, interestRate: 1.5, interestRateType: InterestRateType.FIXED, incomeSource: IncomeSource.EMPLOYED, monthlyIncome: 15000000, applicationStatus: ApplicationStatus.UNDER_REVIEW, submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), creditScore: 720 },
      { memberId: savedMembers[3].member_id, agentId: savedAgents[3].agent_id, loanProductId: savedProducts[3].product_id, loanProductType: LoanProductType.BUSINESS, loanAmount: 8000000, loanTenureMonths: 12, interestRate: 1.5, interestRateType: InterestRateType.FIXED, incomeSource: IncomeSource.SELF_EMPLOYED, monthlyIncome: 12000000, applicationStatus: ApplicationStatus.UNDER_REVIEW, submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), creditScore: 680 },
      // Approved
      { memberId: savedMembers[4].member_id, loanProductId: savedProducts[0].product_id, loanProductType: LoanProductType.PERSONAL, loanAmount: 5000000, loanTenureMonths: 12, interestRate: 1.5, interestRateType: InterestRateType.FIXED, incomeSource: IncomeSource.EMPLOYED, monthlyIncome: 10000000, applicationStatus: ApplicationStatus.APPROVED, submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), reviewedBy: savedUsers[9].user_id, reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), creditScore: 750, approvedBy: savedUsers[9].user_id, approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), branchId: savedBranches[4].branch_id },
      { memberId: savedMembers[5].member_id, agentId: savedAgents[0].agent_id, loanProductId: savedProducts[4].product_id, loanProductType: LoanProductType.EMERGENCY, loanAmount: 3000000, loanTenureMonths: 6, interestRate: 1.25, interestRateType: InterestRateType.FIXED, incomeSource: IncomeSource.EMPLOYED, monthlyIncome: 7000000, applicationStatus: ApplicationStatus.APPROVED, submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), reviewedBy: savedUsers[9].user_id, reviewedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), creditScore: 710, approvedBy: savedUsers[9].user_id, approvedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), branchId: savedBranches[0].branch_id },
      { memberId: savedMembers[6].member_id, agentId: savedAgents[2].agent_id, loanProductId: savedProducts[2].product_id, loanProductType: LoanProductType.BUSINESS, loanAmount: 25000000, loanTenureMonths: 36, interestRate: 1.25, interestRateType: InterestRateType.REDUCING, incomeSource: IncomeSource.BUSINESS, monthlyIncome: 40000000, applicationStatus: ApplicationStatus.APPROVED, submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), reviewedBy: savedUsers[1].user_id, reviewedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), creditScore: 780, approvedBy: savedUsers[1].user_id, approvedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), branchId: savedBranches[1].branch_id },
      // Rejected
      { memberId: savedMembers[7].member_id, loanProductId: savedProducts[1].product_id, loanProductType: LoanProductType.PERSONAL, loanAmount: 20000000, loanTenureMonths: 24, interestRate: 1.5, interestRateType: InterestRateType.FIXED, incomeSource: IncomeSource.EMPLOYED, monthlyIncome: 6000000, applicationStatus: ApplicationStatus.REJECTED, submittedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), reviewedBy: savedUsers[9].user_id, reviewedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), rejectionReason: 'Monthly income does not meet the minimum requirement', creditScore: 520 },
      // Disbursed (with agent)
      { memberId: savedMembers[8].member_id, agentId: savedAgents[0].agent_id, loanProductId: savedProducts[0].product_id, loanProductType: LoanProductType.PERSONAL, loanAmount: 4000000, loanTenureMonths: 9, interestRate: 1.75, interestRateType: InterestRateType.FIXED, incomeSource: IncomeSource.EMPLOYED, monthlyIncome: 9000000, applicationStatus: ApplicationStatus.DISBURSED, submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), reviewedBy: savedUsers[9].user_id, reviewedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), creditScore: 730, approvedBy: savedUsers[9].user_id, approvedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), branchId: savedBranches[0].branch_id, disbursedByAgent: true, agentDisbursementDate: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000) },
      { memberId: savedMembers[9].member_id, agentId: savedAgents[1].agent_id, loanProductId: savedProducts[3].product_id, loanProductType: LoanProductType.BUSINESS, loanAmount: 10000000, loanTenureMonths: 15, interestRate: 1.5, interestRateType: InterestRateType.FIXED, incomeSource: IncomeSource.SELF_EMPLOYED, monthlyIncome: 15000000, applicationStatus: ApplicationStatus.DISBURSED, submittedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), reviewedBy: savedUsers[1].user_id, reviewedAt: new Date(Date.now() - 43 * 24 * 60 * 60 * 1000), creditScore: 695, approvedBy: savedUsers[1].user_id, approvedAt: new Date(Date.now() - 43 * 24 * 60 * 60 * 1000), branchId: savedBranches[1].branch_id, disbursedByAgent: true, agentDisbursementDate: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000) },
      { memberId: savedMembers[10].member_id, agentId: savedAgents[2].agent_id, loanProductId: savedProducts[1].product_id, loanProductType: LoanProductType.PERSONAL, loanAmount: 12000000, loanTenureMonths: 24, interestRate: 1.4, interestRateType: InterestRateType.FIXED, incomeSource: IncomeSource.EMPLOYED, monthlyIncome: 18000000, applicationStatus: ApplicationStatus.DISBURSED, submittedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), reviewedBy: savedUsers[1].user_id, reviewedAt: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000), creditScore: 760, approvedBy: savedUsers[1].user_id, approvedAt: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000), branchId: savedBranches[2].branch_id, disbursedByAgent: true, agentDisbursementDate: new Date(Date.now() - 57 * 24 * 60 * 60 * 1000) },
      { memberId: savedMembers[11].member_id, agentId: savedAgents[2].agent_id, loanProductId: savedProducts[4].product_id, loanProductType: LoanProductType.EMERGENCY, loanAmount: 2500000, loanTenureMonths: 5, interestRate: 1.0, interestRateType: InterestRateType.FIXED, incomeSource: IncomeSource.EMPLOYED, monthlyIncome: 6500000, applicationStatus: ApplicationStatus.DISBURSED, submittedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), reviewedBy: savedUsers[2].user_id, reviewedAt: new Date(Date.now() - 88 * 24 * 60 * 60 * 1000), creditScore: 700, approvedBy: savedUsers[2].user_id, approvedAt: new Date(Date.now() - 88 * 24 * 60 * 60 * 1000), branchId: savedBranches[3].branch_id, disbursedByAgent: true, agentDisbursementDate: new Date(Date.now() - 87 * 24 * 60 * 60 * 1000) },
      { memberId: savedMembers[12].member_id, loanProductId: savedProducts[2].product_id, loanProductType: LoanProductType.BUSINESS, loanAmount: 20000000, loanTenureMonths: 30, interestRate: 1.2, interestRateType: InterestRateType.REDUCING, incomeSource: IncomeSource.BUSINESS, monthlyIncome: 35000000, applicationStatus: ApplicationStatus.DISBURSED, submittedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), reviewedBy: savedUsers[2].user_id, reviewedAt: new Date(Date.now() - 118 * 24 * 60 * 60 * 1000), creditScore: 800, approvedBy: savedUsers[2].user_id, approvedAt: new Date(Date.now() - 118 * 24 * 60 * 60 * 1000), branchId: savedBranches[0].branch_id },
    ];

    const savedApplications: LoanApplication[] = await dataSource.getRepository(LoanApplication).save(applications);
    console.log(`✓ Created ${savedApplications.length} loan applications\n`);

    // ==================== AGENT WALLET TRANSACTIONS ====================
    console.log('Seeding Agent Wallet Transactions...');
    
    const agentTransactions = [
      // Agent 1 - Rudi Hermawan
      { agentId: savedAgents[0].agent_id, transactionType: TransactionType.PETTY_CASH_IN, amount: 10000000, status: TransactionStatus.COMPLETED, description: 'Initial petty cash from admin', balanceBefore: 0, balanceAfter: 10000000, processedBy: savedUsers[1].user_id, processedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { agentId: savedAgents[0].agent_id, transactionType: TransactionType.DISBURSEMENT, amount: 4000000, status: TransactionStatus.COMPLETED, description: 'Disbursed to member', referenceType: 'application', referenceId: savedApplications[8].application_id, balanceBefore: 10000000, balanceAfter: 6000000, processedAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000) },
      { agentId: savedAgents[0].agent_id, transactionType: TransactionType.COLLECTION_IN, amount: 5000000, status: TransactionStatus.COMPLETED, description: 'Collection received from member', referenceType: 'collection', balanceBefore: 6000000, balanceAfter: 11000000, processedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
      { agentId: savedAgents[0].agent_id, transactionType: TransactionType.DEPOSIT, amount: 5000000, status: TransactionStatus.COMPLETED, description: 'Deposit to admin', balanceBefore: 11000000, balanceAfter: 6000000, processedBy: savedUsers[1].user_id, processedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
      // Agent 2 - Sari Dewi
      { agentId: savedAgents[1].agent_id, transactionType: TransactionType.PETTY_CASH_IN, amount: 7500000, status: TransactionStatus.COMPLETED, description: 'Initial petty cash from admin', balanceBefore: 0, balanceAfter: 7500000, processedBy: savedUsers[1].user_id, processedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
      { agentId: savedAgents[1].agent_id, transactionType: TransactionType.DISBURSEMENT, amount: 3000000, status: TransactionStatus.COMPLETED, description: 'Disbursed to member', referenceType: 'application', referenceId: savedApplications[9].application_id, balanceBefore: 7500000, balanceAfter: 4500000, processedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000) },
      { agentId: savedAgents[1].agent_id, transactionType: TransactionType.COLLECTION_IN, amount: 2500000, status: TransactionStatus.COMPLETED, description: 'Collection received from member', balanceBefore: 4500000, balanceAfter: 7000000, processedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      // Agent 3 - Toni Suhartono
      { agentId: savedAgents[2].agent_id, transactionType: TransactionType.PETTY_CASH_IN, amount: 15000000, status: TransactionStatus.COMPLETED, description: 'Initial petty cash from admin', balanceBefore: 0, balanceAfter: 15000000, processedBy: savedUsers[1].user_id, processedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) },
      { agentId: savedAgents[2].agent_id, transactionType: TransactionType.DISBURSEMENT, amount: 8000000, status: TransactionStatus.COMPLETED, description: 'Disbursed to member', referenceType: 'application', referenceId: savedApplications[10].application_id, balanceBefore: 15000000, balanceAfter: 7000000, processedAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000) },
      { agentId: savedAgents[2].agent_id, transactionType: TransactionType.DISBURSEMENT, amount: 5000000, status: TransactionStatus.COMPLETED, description: 'Disbursed to member', referenceType: 'application', referenceId: savedApplications[11].application_id, balanceBefore: 7000000, balanceAfter: 2000000, processedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000) },
      { agentId: savedAgents[2].agent_id, transactionType: TransactionType.PETTY_CASH_IN, amount: 10000000, status: TransactionStatus.COMPLETED, description: 'Additional petty cash from admin', balanceBefore: 2000000, balanceAfter: 12000000, processedBy: savedUsers[1].user_id, processedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
      // Agent 4 - Wati Kusuma
      { agentId: savedAgents[3].agent_id, transactionType: TransactionType.PETTY_CASH_IN, amount: 8000000, status: TransactionStatus.COMPLETED, description: 'Initial petty cash from admin', balanceBefore: 0, balanceAfter: 8000000, processedBy: savedUsers[3].user_id, processedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000) },
      { agentId: savedAgents[3].agent_id, transactionType: TransactionType.COLLECTION_IN, amount: 3000000, status: TransactionStatus.COMPLETED, description: 'Collection received from member', balanceBefore: 8000000, balanceAfter: 11000000, processedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
    ];

    await dataSource.getRepository(AgentWalletTransaction).save(agentTransactions);
    console.log(`✓ Created ${agentTransactions.length} agent wallet transactions\n`);

    // ==================== DISBURSEMENTS ====================
    console.log('Seeding Disbursements...');
    
    const disbursements = [
      // Disbursements belong to the agent who processed them
      { applicationId: savedApplications[8].application_id, memberId: savedMembers[8].member_id, agentId: savedAgents[0].agent_id, disbursementAmount: 4000000, disbursementDate: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000), bankName: 'Bank Central Asia', bankAccountNumber: '1234567890', bankAccountHolder: 'Ahmad Fauzi', transferStatus: TransferStatus.COMPLETED, transferReference: 'TRF/2024/001', notificationSent: true, processedByOfficerId: savedUsers[4].user_id },
      { applicationId: savedApplications[9].application_id, memberId: savedMembers[9].member_id, agentId: savedAgents[1].agent_id, disbursementAmount: 10000000, disbursementDate: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000), bankName: 'Bank Mandiri', bankAccountNumber: '2345678901', bankAccountHolder: 'Jasmine Audrey', transferStatus: TransferStatus.COMPLETED, transferReference: 'TRF/2024/002', notificationSent: true, processedByOfficerId: savedUsers[5].user_id },
      { applicationId: savedApplications[10].application_id, memberId: savedMembers[10].member_id, agentId: savedAgents[2].agent_id, disbursementAmount: 12000000, disbursementDate: new Date(Date.now() - 57 * 24 * 60 * 60 * 1000), bankName: 'Bank Negara Indonesia', bankAccountNumber: '3456789012', bankAccountHolder: 'Kurnia Rahmat', transferStatus: TransferStatus.COMPLETED, transferReference: 'TRF/2024/003', notificationSent: true, processedByOfficerId: savedUsers[6].user_id },
      { applicationId: savedApplications[11].application_id, memberId: savedMembers[11].member_id, agentId: savedAgents[2].agent_id, disbursementAmount: 2500000, disbursementDate: new Date(Date.now() - 87 * 24 * 60 * 60 * 1000), bankName: 'Bank Central Asia', bankAccountNumber: '123456789', bankAccountHolder: 'Lina Marlina', transferStatus: TransferStatus.COMPLETED, transferReference: 'CSH/2024/001', notificationSent: true, processedByOfficerId: savedUsers[7].user_id },
      { applicationId: savedApplications[12].application_id, memberId: savedMembers[12].member_id, disbursementAmount: 20000000, disbursementDate: new Date(Date.now() - 117 * 24 * 60 * 60 * 1000), bankName: 'Bank Central Asia', bankAccountNumber: '4567890123', bankAccountHolder: 'Muhammad Iqbal', transferStatus: TransferStatus.COMPLETED, transferReference: 'TRF/2024/004', notificationSent: true, processedByOfficerId: savedUsers[4].user_id },
    ];

    const savedDisbursements: LoanDisbursement[] = await dataSource.getRepository(LoanDisbursement).save(disbursements);
    console.log(`✓ Created ${savedDisbursements.length} disbursements\n`);

    // ==================== INSTALLMENTS ====================
    console.log('Seeding Installments...');
    
    const installments = [];
    
    // Application 8 - 9 installments
    const app8 = savedApplications[8];
    const monthly8 = Math.round(4000000 * (1 + (1.75/100 * 9/12)) / 9);
    for (let i = 1; i <= 9; i++) {
      const dueDate = new Date(Date.now() - (27 - i * 30) * 24 * 60 * 60 * 1000);
      const isPaid = i <= 6;
      installments.push({
        applicationId: app8.application_id,
        memberId: savedMembers[8].member_id,
        disbursementId: savedDisbursements[0].disbursement_id,
        installmentNumber: i,
        principalAmount: Math.round(monthly8 * 0.7),
        interestAmount: Math.round(monthly8 * 0.3),
        totalAmount: monthly8,
        paidAmount: isPaid ? monthly8 : 0,
        dueDate: dueDate,
        paidDate: isPaid ? dueDate : null,
        installmentStatus: isPaid ? InstallmentStatus.PAID : (dueDate < new Date() ? InstallmentStatus.OVERDUE : InstallmentStatus.PENDING),
        paidByOfficerId: isPaid ? savedUsers[4].user_id : null,
        paymentMethod: isPaid ? 'cash' : null,
        transactionReference: isPaid ? `PAY/2024/${String(i).padStart(4, '0')}` : null,
      });
    }

    // Application 9 - 15 installments
    const app9 = savedApplications[9];
    const monthly9 = Math.round(10000000 * (1 + (1.5/100 * 15/12)) / 15);
    for (let i = 1; i <= 15; i++) {
      const dueDate = new Date(Date.now() - (42 - i * 30) * 24 * 60 * 60 * 1000);
      const isPaid = i <= 5;
      installments.push({
        applicationId: app9.application_id,
        memberId: savedMembers[9].member_id,
        disbursementId: savedDisbursements[1].disbursement_id,
        installmentNumber: i,
        principalAmount: Math.round(monthly9 * 0.75),
        interestAmount: Math.round(monthly9 * 0.25),
        totalAmount: monthly9,
        paidAmount: isPaid ? monthly9 : 0,
        dueDate: dueDate,
        paidDate: isPaid ? dueDate : null,
        installmentStatus: isPaid ? InstallmentStatus.PAID : (dueDate < new Date() ? InstallmentStatus.OVERDUE : InstallmentStatus.PENDING),
        paidByOfficerId: isPaid ? savedUsers[5].user_id : null,
        paymentMethod: isPaid ? 'transfer' : null,
        transactionReference: isPaid ? `PAY/2024/${String(100 + i).padStart(4, '0')}` : null,
      });
    }

    // Application 10 - 24 installments
    const app10 = savedApplications[10];
    const monthly10 = Math.round(12000000 * (1 + (1.4/100 * 24/12)) / 24);
    for (let i = 1; i <= 24; i++) {
      const dueDate = new Date(Date.now() - (57 - i * 30) * 24 * 60 * 60 * 1000);
      const isPaid = i <= 3;
      installments.push({
        applicationId: app10.application_id,
        memberId: savedMembers[10].member_id,
        disbursementId: savedDisbursements[2].disbursement_id,
        installmentNumber: i,
        principalAmount: Math.round(monthly10 * 0.8),
        interestAmount: Math.round(monthly10 * 0.2),
        totalAmount: monthly10,
        paidAmount: isPaid ? monthly10 : 0,
        dueDate: dueDate,
        paidDate: isPaid ? dueDate : null,
        installmentStatus: isPaid ? InstallmentStatus.PAID : (dueDate < new Date() ? InstallmentStatus.OVERDUE : InstallmentStatus.PENDING),
        paidByOfficerId: isPaid ? savedUsers[6].user_id : null,
        paymentMethod: isPaid ? 'transfer' : null,
        transactionReference: isPaid ? `PAY/2024/${String(200 + i).padStart(4, '0')}` : null,
      });
    }

    // Application 11 - 5 installments
    const app11 = savedApplications[11];
    const monthly11 = Math.round(2500000 * (1 + (1.0/100 * 5/12)) / 5);
    for (let i = 1; i <= 5; i++) {
      const dueDate = new Date(Date.now() - (87 - i * 30) * 24 * 60 * 60 * 1000);
      const isPaid = i <= 5;
      installments.push({
        applicationId: app11.application_id,
        memberId: savedMembers[11].member_id,
        disbursementId: savedDisbursements[3].disbursement_id,
        installmentNumber: i,
        principalAmount: Math.round(monthly11 * 0.85),
        interestAmount: Math.round(monthly11 * 0.15),
        totalAmount: monthly11,
        paidAmount: isPaid ? monthly11 : 0,
        dueDate: dueDate,
        paidDate: isPaid ? dueDate : null,
        installmentStatus: isPaid ? InstallmentStatus.PAID : (dueDate < new Date() ? InstallmentStatus.OVERDUE : InstallmentStatus.PENDING),
        paidByOfficerId: isPaid ? savedUsers[7].user_id : null,
        paymentMethod: isPaid ? 'cash' : null,
        transactionReference: isPaid ? `PAY/2024/${String(300 + i).padStart(4, '0')}` : null,
      });
    }

    // Application 12 - 30 installments
    const app12 = savedApplications[12];
    const monthly12 = Math.round(20000000 * (1 + (1.2/100 * 30/12)) / 30);
    for (let i = 1; i <= 30; i++) {
      const dueDate = new Date(Date.now() - (117 - i * 30) * 24 * 60 * 60 * 1000);
      const isPaid = i <= 2;
      installments.push({
        applicationId: app12.application_id,
        memberId: savedMembers[12].member_id,
        disbursementId: savedDisbursements[4].disbursement_id,
        installmentNumber: i,
        principalAmount: Math.round(monthly12 * 0.9),
        interestAmount: Math.round(monthly12 * 0.1),
        totalAmount: monthly12,
        paidAmount: isPaid ? monthly12 : 0,
        dueDate: dueDate,
        paidDate: isPaid ? dueDate : null,
        installmentStatus: isPaid ? InstallmentStatus.PAID : (dueDate < new Date() ? InstallmentStatus.OVERDUE : InstallmentStatus.PENDING),
        paidByOfficerId: isPaid ? savedUsers[4].user_id : null,
        paymentMethod: isPaid ? 'transfer' : null,
        transactionReference: isPaid ? `PAY/2024/${String(400 + i).padStart(4, '0')}` : null,
      });
    }

    const savedInstallments: LoanInstallment[] = await dataSource.getRepository(LoanInstallment).save(installments);
    console.log(`✓ Created ${savedInstallments.length} installments\n`);

    // ==================== COLLECTIONS ====================
    console.log('Seeding Collections...');
    
    const collections = [];
    
    // Create collections from installments - collections belong to the agent who brought the member
    for (const inst of savedInstallments) {
      const isPaid = inst.installmentStatus === InstallmentStatus.PAID;
      const status = isPaid ? CollectionStatus.PAID : (inst.dueDate < new Date() ? CollectionStatus.OVERDUE : CollectionStatus.PENDING);
      // Find the agent from the member
      const member = savedMembers.find(m => m.member_id === inst.memberId);
      collections.push({
        applicationId: inst.applicationId,
        memberId: inst.memberId,
        disbursementId: inst.disbursementId,
        installmentNumber: inst.installmentNumber,
        dueDate: inst.dueDate,
        dueAmount: inst.totalAmount,
        paidAmount: inst.paidAmount,
        paidDate: inst.paidDate,
        collectionStatus: status,
        agentId: member?.agentId || null,
        collectedByOfficerId: inst.paidByOfficerId,
        notes: isPaid ? 'Payment received' : null,
      });
    }

    const savedCollections: LoanCollection[] = await dataSource.getRepository(LoanCollection).save(collections);
    console.log(`✓ Created ${savedCollections.length} collections\n`);

    // ==================== FIELD VERIFICATIONS ====================
    console.log('Seeding Field Verifications...');
    
    const fieldVerifications = [
      {
        applicationId: savedApplications[2].application_id,
        officerId: savedUsers[4].user_id,
        verificationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        gpsLatitude: -6.2088,
        gpsLongitude: 106.8456,
        addressVerified: true,
        checklistCompleted: true,
        checklistData: { residence: true, business: true, neighbors: true },
        signatureUrl: 'https://example.com/sig/1.pdf',
        verificationStatus: VerificationStatus.PASSED,
        notes: 'Verification completed successfully',
      },
      {
        applicationId: savedApplications[3].application_id,
        officerId: savedUsers[5].user_id,
        verificationDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        gpsLatitude: -6.9175,
        gpsLongitude: 107.6191,
        addressVerified: true,
        checklistCompleted: true,
        checklistData: { residence: true, business: true, neighbors: false },
        signatureUrl: 'https://example.com/sig/2.pdf',
        verificationStatus: VerificationStatus.PASSED,
        notes: 'All documents verified',
      },
      {
        applicationId: savedApplications[4].application_id,
        officerId: savedUsers[8].user_id,
        verificationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        gpsLatitude: -6.9825,
        gpsLongitude: 110.4204,
        addressVerified: true,
        checklistCompleted: false,
        checklistData: { residence: true, business: false },
        verificationStatus: VerificationStatus.PENDING,
        notes: 'Awaiting additional documents',
      },
    ];

    const savedFieldVerifications: FieldVerification[] = await dataSource.getRepository(FieldVerification).save(fieldVerifications);
    console.log(`✓ Created ${savedFieldVerifications.length} field verifications\n`);

    // ==================== LOAN DOCUMENTS ====================
    console.log('Seeding Loan Documents...');
    
    const documents = [
      {
        applicationId: savedApplications[8].application_id,
        memberId: savedMembers[8].member_id,
        documentType: DocumentType.KTP,
        fileUrl: 'https://example.com/docs/ktp_1.jpg',
        fileName: 'KTP_Ahmad_Fauzi.jpg',
        captureTimestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        uploadedByOfficerId: savedUsers[4].user_id,
      },
      {
        applicationId: savedApplications[8].application_id,
        memberId: savedMembers[8].member_id,
        documentType: DocumentType.INCOME_PROOF,
        fileUrl: 'https://example.com/docs/slip_1.pdf',
        fileName: 'Slip_Gaji_Ahmad_Fauzi.pdf',
        captureTimestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        uploadedByOfficerId: savedUsers[4].user_id,
      },
      {
        applicationId: savedApplications[9].application_id,
        memberId: savedMembers[9].member_id,
        documentType: DocumentType.KTP,
        fileUrl: 'https://example.com/docs/ktp_2.jpg',
        fileName: 'KTP_Jasmine_Audrey.jpg',
        captureTimestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        uploadedByOfficerId: savedUsers[5].user_id,
      },
      {
        applicationId: savedApplications[10].application_id,
        memberId: savedMembers[10].member_id,
        documentType: DocumentType.KTP,
        fileUrl: 'https://example.com/docs/ktp_3.jpg',
        fileName: 'KTP_Kurnia_Rahmat.jpg',
        captureTimestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        uploadedByOfficerId: savedUsers[6].user_id,
      },
      {
        applicationId: savedApplications[10].application_id,
        memberId: savedMembers[10].member_id,
        documentType: DocumentType.INCOME_PROOF,
        fileUrl: 'https://example.com/docs/slip_3.pdf',
        fileName: 'Slip_Gaji_Kurnia_Rahmat.pdf',
        captureTimestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        uploadedByOfficerId: savedUsers[6].user_id,
      },
    ];

    const savedDocuments: LoanDocument[] = await dataSource.getRepository(LoanDocument).save(documents);
    console.log(`✓ Created ${savedDocuments.length} loan documents\n`);

    // ==================== VIRTUAL ACCOUNTS ====================
    console.log('Seeding Virtual Accounts...');
    
    const virtualAccounts = [
      { memberId: savedMembers[0].member_id, vaNumber: '888801000001', bankName: 'Bank Central Asia', isActive: true },
      { memberId: savedMembers[1].member_id, vaNumber: '888801000002', bankName: 'Bank Central Asia', isActive: true },
      { memberId: savedMembers[2].member_id, vaNumber: '888801000003', bankName: 'Bank Central Asia', isActive: true },
      { memberId: savedMembers[3].member_id, vaNumber: '888801000004', bankName: 'Bank Central Asia', isActive: true },
      { memberId: savedMembers[4].member_id, vaNumber: '888801000005', bankName: 'Bank Central Asia', isActive: true },
      { memberId: savedMembers[5].member_id, vaNumber: '888801000006', bankName: 'Bank Mandiri', isActive: true },
      { memberId: savedMembers[6].member_id, vaNumber: '888801000007', bankName: 'Bank Negara Indonesia', isActive: true },
      { memberId: savedMembers[7].member_id, vaNumber: '888801000008', bankName: 'Bank Central Asia', isActive: true },
      { memberId: savedMembers[8].member_id, vaNumber: '888801000009', bankName: 'Bank Central Asia', isActive: true },
      { memberId: savedMembers[9].member_id, vaNumber: '888801000010', bankName: 'Bank Central Asia', isActive: true },
    ];

    const savedVirtualAccounts: VirtualAccount[] = await dataSource.getRepository(VirtualAccount).save(virtualAccounts);
    console.log(`✓ Created ${savedVirtualAccounts.length} virtual accounts\n`);

    // ==================== NOTIFICATIONS ====================
    console.log('Seeding Notifications...');
    
    const notifications = [
      { userId: savedUsers[0].user_id, title: 'Welcome to Kopi Mas', message: 'Your account has been created successfully', notificationType: NotificationType.SYSTEM, priority: NotificationPriority.MEDIUM },
      { userId: savedUsers[4].user_id, title: 'New Loan Application', message: 'A new loan application has been submitted', notificationType: NotificationType.APPLICATION, priority: NotificationPriority.HIGH, entityType: 'LoanApplication', entityId: savedApplications[0].application_id },
      { userId: savedUsers[9].user_id, title: 'Application Approved', message: 'Loan application has been approved', notificationType: NotificationType.APPROVAL, priority: NotificationPriority.URGENT, entityType: 'LoanApplication', entityId: savedApplications[4].application_id, isRead: true, readAt: new Date() },
      { userId: savedUsers[9].user_id, title: 'Disbursement Complete', message: 'Loan disbursement has been completed', notificationType: NotificationType.DISBURSEMENT, priority: NotificationPriority.HIGH, entityType: 'LoanApplication', entityId: savedApplications[8].application_id },
      { userId: savedUsers[4].user_id, title: 'Payment Received', message: 'Payment has been recorded for installment', notificationType: NotificationType.PAYMENT, priority: NotificationPriority.MEDIUM, entityType: 'Collection', isRead: true, readAt: new Date() },
      { userId: savedUsers[5].user_id, title: 'Overdue Reminder', message: 'There are overdue installments', notificationType: NotificationType.OVERDUE, priority: NotificationPriority.URGENT },
      { userId: savedUsers[1].user_id, title: 'New Member Registered', message: 'A new member has registered in your branch', notificationType: NotificationType.SYSTEM, priority: NotificationPriority.MEDIUM },
      { userId: savedUsers[0].user_id, title: 'System Update', message: 'System maintenance scheduled for this weekend', notificationType: NotificationType.SYSTEM, priority: NotificationPriority.LOW },
    ];

    const savedNotifications: Notification[] = await dataSource.getRepository(Notification).save(notifications);
    console.log(`✓ Created ${savedNotifications.length} notifications\n`);

    // ==================== INTEGRATIONS ====================
    console.log('Seeding Integrations...');
    
    const integrations = [
      { integrationName: 'Twilio SMS', integrationType: IntegrationType.SMS_GATEWAY, provider: 'Twilio', apiKey: 'xxx', webhookUrl: 'https://api.kopimas.com/webhook/sms', isActive: true, integrationStatus: IntegrationStatus.ACTIVE, environment: 'production', settings: { fromNumber: '+1234567890' } },
      { integrationName: 'Midtrans Payment', integrationType: IntegrationType.PAYMENT_GATEWAY, provider: 'Midtrans', apiKey: 'xxx', webhookUrl: 'https://api.kopimas.com/webhook/payment', isActive: true, integrationStatus: IntegrationStatus.ACTIVE, environment: 'production', settings: { merchantId: 'MID001' } },
      { integrationName: 'SendGrid Email', integrationType: IntegrationType.EMAIL_SERVICE, provider: 'SendGrid', apiKey: 'xxx', isActive: false, integrationStatus: IntegrationStatus.INACTIVE, environment: 'sandbox' },
      { integrationName: 'SLIK Credit Bureau', integrationType: IntegrationType.CREDIT_BUREAU, provider: 'BI', apiKey: 'xxx', webhookUrl: 'https://api.kopimas.com/webhook/credit', isActive: true, integrationStatus: IntegrationStatus.ACTIVE, environment: 'production' },
      { integrationName: 'Veriff e-KYC', integrationType: IntegrationType.E_KYC, provider: 'Veriff', apiKey: 'xxx', isActive: true, integrationStatus: IntegrationStatus.TESTING, environment: 'sandbox' },
      { integrationName: 'BCA Banking API', integrationType: IntegrationType.BANKING_API, provider: 'Bank Central Asia', apiKey: 'xxx', callbackUrl: 'https://api.kopimas.com/webhook/bca', isActive: true, integrationStatus: IntegrationStatus.ACTIVE, environment: 'production' },
      { integrationName: 'WhatsApp Business', integrationType: IntegrationType.WHATSAPP, provider: 'Meta', apiKey: 'xxx', isActive: false, integrationStatus: IntegrationStatus.INACTIVE, environment: 'sandbox' },
    ];

    const savedIntegrations: Integration[] = await dataSource.getRepository(Integration).save(integrations);
    console.log(`✓ Created ${savedIntegrations.length} integrations\n`);

    // ==================== PAYMENTS ====================
    console.log('Seeding Payments...');
    
    const payments = [
      // Payments belong to the agent who brought the member
      {
        applicationId: savedApplications[8].application_id,
        memberId: savedMembers[8].member_id,
        agentId: savedAgents[0].agent_id,
        collectionId: savedCollections[0].collection_id,
        installmentId: savedInstallments[0].installment_id,
        paymentAmount: savedInstallments[0].totalAmount,
        paymentMethod: PaymentMethod.TRANSFER,
        paymentStatus: PaymentStatus.COMPLETED,
        transactionReference: 'TRF/PAY/001',
        paidAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        processedByOfficerId: savedUsers[4].user_id,
        senderAccountNumber: '1234567890',
        senderBankName: 'Bank Central Asia',
        senderName: 'Ahmad Fauzi',
      },
      {
        applicationId: savedApplications[9].application_id,
        memberId: savedMembers[9].member_id,
        agentId: savedAgents[1].agent_id,
        collectionId: savedCollections[15].collection_id,
        installmentId: savedInstallments[15].installment_id,
        paymentAmount: savedInstallments[15].totalAmount,
        paymentMethod: PaymentMethod.CASH,
        paymentStatus: PaymentStatus.COMPLETED,
        transactionReference: 'CSH/PAY/001',
        paidAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        processedByOfficerId: savedUsers[5].user_id,
        senderName: 'Jasmine Audrey',
      },
      {
        applicationId: savedApplications[10].application_id,
        memberId: savedMembers[10].member_id,
        agentId: savedAgents[2].agent_id,
        collectionId: savedCollections[30].collection_id,
        installmentId: savedInstallments[30].installment_id,
        paymentAmount: savedInstallments[30].totalAmount,
        paymentMethod: PaymentMethod.VIRTUAL_ACCOUNT,
        paymentStatus: PaymentStatus.COMPLETED,
        transactionReference: 'VA/PAY/001',
        externalReference: '888801000003',
        paidAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
        processedByOfficerId: savedUsers[6].user_id,
        senderName: 'Kurnia Rahmat',
      },
      {
        applicationId: savedApplications[8].application_id,
        memberId: savedMembers[8].member_id,
        agentId: savedAgents[0].agent_id,
        collectionId: savedCollections[1].collection_id,
        installmentId: savedInstallments[1].installment_id,
        paymentAmount: savedInstallments[1].totalAmount,
        paymentMethod: PaymentMethod.TRANSFER,
        paymentStatus: PaymentStatus.PENDING,
        transactionReference: 'TRF/PAY/002',
        processedByOfficerId: savedUsers[4].user_id,
        senderAccountNumber: '1234567890',
        senderBankName: 'Bank Central Asia',
        senderName: 'Ahmad Fauzi',
      },
      {
        applicationId: savedApplications[9].application_id,
        memberId: savedMembers[9].member_id,
        agentId: savedAgents[1].agent_id,
        collectionId: savedCollections[16].collection_id,
        installmentId: savedInstallments[16].installment_id,
        paymentAmount: savedInstallments[16].totalAmount,
        paymentMethod: PaymentMethod.OVO,
        paymentStatus: PaymentStatus.COMPLETED,
        transactionReference: 'OVO/PAY/001',
        paidAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000),
        processedByOfficerId: savedUsers[5].user_id,
        senderName: 'Jasmine Audrey',
      },
      {
        applicationId: savedApplications[10].application_id,
        memberId: savedMembers[10].member_id,
        agentId: savedAgents[2].agent_id,
        collectionId: savedCollections[31].collection_id,
        installmentId: savedInstallments[31].installment_id,
        paymentAmount: savedInstallments[31].totalAmount,
        paymentMethod: PaymentMethod.QRIS,
        paymentStatus: PaymentStatus.FAILED,
        transactionReference: 'QRIS/PAY/001',
        processedByOfficerId: savedUsers[6].user_id,
        senderName: 'Kurnia Rahmat',
        notes: 'Transaction failed - insufficient balance',
      },
    ];

    const savedPayments: Payment[] = await dataSource.getRepository(Payment).save(payments);
    console.log(`✓ Created ${savedPayments.length} payments\n`);

    console.log('===========================================');
    console.log('Database seeding completed successfully!');
    console.log('===========================================');
    console.log('\nSummary:');
    console.log(`- Regions: ${savedRegions.length}`);
    console.log(`- Branches: ${savedBranches.length}`);
    console.log(`- Users: ${savedUsers.length}`);
    console.log(`- Agents: ${savedAgents.length}`);
    console.log(`- Loan Products: ${savedProducts.length}`);
    console.log(`- Members: ${savedMembers.length}`);
    console.log(`- Loan Applications: ${savedApplications.length}`);
    console.log(`- Disbursements: ${savedDisbursements.length}`);
    console.log(`- Installments: ${savedInstallments.length}`);
    console.log(`- Collections: ${savedCollections.length}`);
    console.log(`- Field Verifications: ${savedFieldVerifications.length}`);
    console.log(`- Loan Documents: ${savedDocuments.length}`);
    console.log(`- Virtual Accounts: ${savedVirtualAccounts.length}`);
    console.log(`- Notifications: ${savedNotifications.length}`);
    console.log(`- Integrations: ${savedIntegrations.length}`);
    console.log(`- Payments: ${savedPayments.length}`);
    console.log('\nTest Accounts:');
    console.log('- Email: admin@kopimas.com | Password: password123 | Role: System Admin');
    console.log('- Email: officer.jkt1@kopimas.com | Password: password123 | Role: Officer');
    console.log('- Email: supervisor@kopimas.com | Password: password123 | Role: Supervisor');
    console.log('\nAgent Accounts (linked to Officers):');
    console.log('- AGT001: Rudi Hermawan (Jakarta Pusat) - linked to officer_jkt1');
    console.log('- AGT002: Sari Dewi (Jakarta Selatan) - linked to officer_jkt2');
    console.log('- AGT003: Toni Suhartono (Bandung) - linked to officer_bdg');
    console.log('- AGT004: Wati Kusuma (Surabaya) - linked to officer_sby');

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
