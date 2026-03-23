# Kopi Mas Backend

Kopi Mas - Koperasi Pinjaman Masyarakat Backend API built with NestJS, TypeScript, and PostgreSQL.

## Version

2.0

## Tech Stack

- **Framework:** NestJS with TypeScript
- **Database:** PostgreSQL with TypeORM
- **Authentication:** JWT with Passport
- **API Documentation:** Swagger/OpenAPI
- **Validation:** class-validator & class-transformer

## Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- npm or yarn

## Quick Start with Docker

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start PostgreSQL and Redis containers
docker-compose up -d

# 3. Install dependencies
npm install

# 4. Run development server
npm run start:dev
```

## Manual Setup

### Without Docker

```bash
# Install dependencies
npm install

# Create database manually
createdb kopi_mas
```

### With Docker Only (Database)

```bash
# Start only PostgreSQL and Redis
docker-compose up -d postgres redis

# Verify containers are running
docker-compose ps
```

## Configuration

Create a `.env` file in the project root (copy from `.env.example`):

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=kopi_mas

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# AWS S3 (optional)
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=kopi-mas-documents

# Twilio (optional)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# CORS
CORS_ORIGIN=*
```

## Docker Commands

```bash
# Start all services (PostgreSQL + Redis)
docker-compose up -d

# Start specific service
docker-compose up -d postgres
docker-compose up -d redis

# Stop all services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f postgres
docker-compose logs -f redis
```

## Build

## Run Development

```bash
# Start with watch mode
npm run start:dev

# The API will be available at http://localhost:3000
# Swagger documentation at http://localhost:3000/api/docs
```

## Run Production

```bash
# Build first
npm run build

# Start production server
npm run start:prod
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token

### Users
- `GET /api/v1/users` - List all users (Admin only)
- `POST /api/v1/users` - Create user (System Admin)
- `PATCH /api/v1/users/:user_id` - Update user (System Admin)
- `DELETE /api/v1/users/:user_id` - Delete user (System Admin)
- `POST /api/v1/users/:user_id/reset-password` - Reset password

### Members
- `GET /api/v1/members` - List all members
- `POST /api/v1/members` - Create member (Officer)
- `GET /api/v1/members/:member_id` - Get member details
- `PATCH /api/v1/members/:member_id` - Update member (Officer)
- `DELETE /api/v1/members/:member_id` - Delete member (Admin)

### Loan Applications
- `GET /api/v1/loan-applications` - List applications
- `POST /api/v1/loan-applications` - Create application (Officer)
- `GET /api/v1/loan-applications/:application_id` - Get application
- `PATCH /api/v1/loan-applications/:application_id/status` - Update status (Admin)

### Loan Products
- `GET /api/v1/loan-products` - List active products
- `POST /api/v1/loan-products` - Create product (Admin)
- `PATCH /api/v1/loan-products/:product_id` - Update product (Admin)

### Documents
- `GET /api/v1/loan-applications/:application_id/documents` - List documents
- `POST /api/v1/loan-applications/:application_id/documents` - Upload document

### Field Verifications
- `GET /api/v1/field-verifications` - List verifications
- `POST /api/v1/field-verifications` - Create verification (Officer)
- `GET /api/v1/field-verifications/:verification_id` - Get verification
- `PATCH /api/v1/field-verifications/:verification_id` - Update verification

### Disbursements
- `GET /api/v1/disbursements` - List disbursements
- `POST /api/v1/disbursements` - Create disbursement (Officer)
- `GET /api/v1/disbursements/:disbursement_id/receipt` - Get receipt
- `POST /api/v1/disbursements/:disbursement_id/notify` - Send notification

### Reports
- `GET /api/v1/reports/portfolio` - Portfolio summary (Admin)
- `GET /api/v1/reports/officer-performance` - Officer performance (Admin)
- `POST /api/v1/reports/export` - Export report (Admin)

## User Roles

- `system_admin` - Full system access
- `admin` - Admin operations
- `supervisor` - Supervisory functions
- `regional_supervisor` - Regional oversight
- `officer` - Field operations

## Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## Database Seeding

Seed the database with comprehensive mock data for development and testing:

```bash
# Seed all data (regions, branches, users, products, members, applications, disbursements, installments, collections)
npm run start:seed-all
```

### Seeded Data Summary

| Entity | Count | Description |
|--------|-------|-------------|
| Regions | 5 | Jawa Barat, Jawa Tengah, Jawa Timur, Sumatera, Kalimantan |
| Branches | 8 | Jakarta Pusat, Jakarta Selatan, Bandung, Surabaya, Semarang, Medan, Palembang, Balikpapan |
| Users | 10 | Admin, Regional Admins, Officers, Supervisor |
| Loan Products | 6 | Personal Micro, Personal Standard, Bisnis Usaha, Bisnis Mikro, Darurat Kesehatan, Darurat Keluarga |
| Members | 15 | Members from various cities across Indonesia |
| Loan Applications | 13 | Various statuses (submitted, under_review, approved, rejected, disbursed) |
| Disbursements | 5 | Completed disbursements |
| Installments | 83 | Distributed across disbursements with various payment statuses |
| Collections | 83 | Collections mirroring installments |

### Test Accounts

After seeding, you can login with these accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@kopimas.com | password123 | System Admin |
| admin.jabar@kopimas.com | password123 | Regional Admin (Jawa Barat) |
| officer.jkt1@kopimas.com | password123 | Officer (Jakarta) |
| supervisor@kopimas.com | password123 | Supervisor |

### Seed Superadmin Only

If you only need the superadmin user:

```bash
npm run start:seed-superadmin
```

### Seed Individual Modules

You can also seed individual modules by running the main seeder - it handles all relationships automatically and is idempotent (safe to run multiple times).

## Project Structure

```
src/
├── modules/
│   ├── auth/           # Authentication module
│   ├── users/          # User management
│   ├── members/        # Member management
│   ├── loan-applications/  # Loan applications
│   ├── loan-documents/    # Document management
│   ├── loan-products/    # Product management
│   ├── field-verifications/ # Field verification
│   ├── disbursements/   # Disbursement processing
│   ├── branches/       # Branch management
│   ├── regions/        # Region management
│   └── reports/        # Reporting
├── common/
│   └── decorators/    # Custom decorators
├── config/             # Configuration
└── main.ts            # Application entry
```

## License

Proprietary - Kopi Mas
