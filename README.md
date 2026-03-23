# Credina - Micro Lending Platform

<p align="center">
  Credina - Micro Lending Platform
</p>

<p align="center">
  <strong>Credina</strong> is a comprehensive cooperative micro-lending platform that enables financial institutions to efficiently manage member registrations, loan applications, disbursements, and collections through a modern multi-application architecture.
</p>

<p align="center">
  <a href="https://github.com/armar22/credina/stargazers">
    <img src="https://img.shields.io/github/stars/armar22/credina?style=flat-square" alt="Stars" />
  </a>
  <a href="https://github.com/armar22/credina/issues">
    <img src="https://img.shields.io/github/issues/armar22/credina?style=flat-square" alt="Issues" />
  </a>
  <a href="https://github.com/armar22/credina/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/armar22/credina?style=flat-square" alt="License" />
  </a>
  <a href="https://discord.gg/credina">
    <img src="https://img.shields.io/discord/1234567890?style=flat-square" alt="Discord" />
  </a>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Products](#products)
  - [Credina API](#credina-api)
  - [Credina Admin](#credina-admin)
  - [Credina Officer](#credina-officer)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development Commands](#development-commands)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)
- [Support](#support)
- [Acknowledgments](#acknowledgments)

---

## Overview

Credina is a complete micro-lending solution designed for cooperative financial institutions. The platform provides end-to-end management of the lending lifecycle, from member onboarding to loan disbursement and collection tracking.

### Key Capabilities

- **Multi-channel Access**: Web admin dashboard and mobile field officer app
- **Offline-first Mobile**: Work anywhere with local data sync capabilities
- **Real-time Operations**: Instant loan approvals and disbursements
- **Comprehensive Reporting**: Portfolio analytics and financial summaries
- **Role-based Access**: Granular permissions for different user types

---

## Architecture

Credina uses a modern microservices-ready monorepo architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CREDINA PLATFORM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│  │  Credina     │     │  Credina     │     │  Credina     │   │
│  │  Admin       │────▶│  API         │◀────│  Officer     │   │
│  │  (Web)       │     │  (Backend)   │     │  (Mobile)    │   │
│  └──────────────┘     └──────────────┘     └──────────────┘   │
│         │                     │                     │           │
│         └─────────────────────┴─────────────────────┘           │
│                               │                                 │
│                    ┌──────────┴──────────┐                    │
│                    │   PostgreSQL DB     │                    │
│                    │   Redis Cache       │                    │
│                    │   MinIO Storage     │                    │
│                    └─────────────────────┘                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
applications/
├── kopi-mas-backend/          # NestJS Backend API (Node.js)
├── kopi-mas-admin/            # Next.js 16 Admin Dashboard
├── kopi-mas-officer/           # Flutter Mobile App
├── README.md                   # This file
└── products.md                 # Product design specifications
```

---

## Tech Stack

### Backend (Credina API)

| Category | Technology |
|----------|------------|
| Framework | NestJS 10.x |
| Language | TypeScript 5.x |
| Database | PostgreSQL 14+ |
| ORM | TypeORM |
| Authentication | JWT (Passport.js) |
| API Documentation | Swagger/OpenAPI |
| Validation | class-validator |
| File Storage | MinIO (S3-compatible) |
| Testing | Jest |
| Caching | Redis |

### Web Admin (Credina Admin)

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 |
| Components | Radix UI + Shadcn UI |
| State Management | Zustand |
| Data Fetching | TanStack Query |
| Charts | Recharts |
| Forms | React Hook Form + Zod |

### Mobile App (Credina Officer)

| Category | Technology |
|----------|------------|
| Framework | Flutter 3.4+ |
| Language | Dart |
| State Management | Riverpod 2.x |
| Navigation | GoRouter |
| HTTP Client | Dio |
| Local Database | Drift (SQLite) |
| Secure Storage | flutter_secure_storage |
| Code Generation | Freezed, JSON Serializable |

---

## Products

### Credina API

The RESTful backend API that powers the entire platform. It handles all business logic, data management, and external integrations.

**Location:** `applications/kopi-mas-backend/`

**Key Features:**
- User authentication and authorization
- Member management with OCR support
- Loan application processing
- Field verification workflows
- Disbursement management
- Collection tracking
- Installment scheduling
- Financial reporting
- Virtual account management
- Audit logging

**Run:**
```bash
cd applications/kopi-mas-backend
npm install
npm run start:dev
```

---

### Credina Admin

A comprehensive administrative web dashboard for managing all aspects of the lending operations.

**Location:** `applications/kopi-mas-admin/`

**Key Features:**
- Dashboard with KPIs and analytics
- Member management with search/filter
- Loan application pipeline (Kanban view)
- Product configuration
- Branch and region management
- User administration
- Collection tracking
- Verification approvals
- Report generation
- System settings

**Run:**
```bash
cd applications/kopi-mas-admin
npm install
npm run dev
```

---

### Credina Officer

A mobile application for field officers to manage members, process loan applications, and track collections on-the-go.

**Location:** `applications/kopi-mas-officer/`

**Key Features:**
- Member registration and management
- Loan application submission
- Field verification with GPS and camera
- Collection recording
- Offline data sync
- Push notifications
- Profile management

**Build:**
```bash
cd applications/kopi-mas-officer
flutter pub get
flutter build apk --release
```

---

## Features

### Core Functionality

| Feature | Description |
|---------|-------------|
| **Authentication** | JWT-based secure login with role-based access |
| **Member Management** | Complete CRUD operations with OCR for ID cards |
| **Loan Applications** | Multi-step application process with status tracking |
| **Loan Products** | Configurable product types with custom terms |
| **Field Verification** | GPS-tagged verification with photo capture |
| **Disbursements** | Virtual account generation and fund transfer |
| **Collections** | Payment recording and installment tracking |
| **Reporting** | Portfolio analytics and financial summaries |

### Advanced Features

| Feature | Description |
|---------|-------------|
| **OCR Processing** | Automatic extraction from Indonesian ID cards (KTP) |
| **Virtual Accounts** | Bank integration for payment processing |
| **Offline Mode** | Local database for field operations without internet |
| **Audit Trails** | Complete activity logging for compliance |
| **Approval Workflows** | Configurable multi-level approvals |
| **Credit Scoring** | Automated risk assessment |
| **Notifications** | Push notifications and SMS alerts |

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Runtime for backend and admin |
| npm | 9+ | Package management |
| Docker | Latest | Container services |
| Docker Compose | Latest | Service orchestration |
| PostgreSQL | 14+ | Primary database |
| Redis | 7+ | Caching layer |
| Flutter SDK | 3.4+ | Mobile development |
| Dart | 3.4+ | Flutter language |

### Quick Start

#### 1. Clone the Repository

```bash
git clone https://github.com/armar22/credina.git
cd credina/applications
```

#### 2. Start Backend Services

```bash
cd kopi-mas-backend

# Copy environment configuration
cp .env.example .env

# Start PostgreSQL, Redis, and MinIO
docker-compose up -d

# Install dependencies
npm install

# Run database migrations
npm run typeorm migration:run

# Seed initial data (optional)
npm run seed:all

# Start development server
npm run start:dev
```

The API will be available at:
- **API:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api/docs

#### 3. Start Admin Dashboard

```bash
cd kopi-mas-admin

# Copy environment configuration
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```

The admin dashboard will be available at http://localhost:3001

#### 4. Setup Mobile App (Officer)

```bash
cd kopi-mas-officer

# Install dependencies
flutter pub get

# Generate code (if using code generation)
dart run build_runner build

# Run on emulator/device
flutter run
```

---

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in `applications/kopi-mas-backend/`:

```env
# =============================================
# SERVER CONFIGURATION
# =============================================
PORT=3000
NODE_ENV=development

# =============================================
# DATABASE CONFIGURATION
# =============================================
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=kopi_mas

# =============================================
# JWT CONFIGURATION
# =============================================
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# =============================================
# REDIS CONFIGURATION (Optional)
# =============================================
REDIS_HOST=localhost
REDIS_PORT=6379

# =============================================
# AWS S3 / MINIO CONFIGURATION (Optional)
# =============================================
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=kopi-mas-documents
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_ENDPOINT=http://localhost:9000

# =============================================
# TWILIO CONFIGURATION (Optional - Notifications)
# =============================================
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Admin Environment Variables

Create a `.env.local` file in `applications/kopi-mas-admin/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Credina
```

### Mobile App Configuration

Update the API base URL in `applications/kopi-mas-officer/lib/core/constants/app_constants.dart`:

```dart
class AppConstants {
  static const String baseUrl = 'http://localhost:3000';
  // ... other constants
}
```

---

## Database Setup

### Running Migrations

```bash
cd applications/kopi-mas-backend

# Generate a new migration
npm run typeorm migration:generate -- -d src/database/datasource.ts src/database/migrations/MigrationName

# Run all pending migrations
npm run typeorm migration:run -- -d src/database/datasource.ts
```

### Seeding Data

The project includes seed scripts to populate the database with test data:

```bash
# Seed superadmin user only
npm run seed:superadmin

# Seed all initial data (recommended for development)
npm run seed:all
```

### Seeded Data Overview

| Entity | Count | Description |
|--------|-------|-------------|
| Regions | 5 | Jawa Barat, Jawa Tengah, Jawa Timur, Sumatera, Kalimantan |
| Branches | 8 | Jakarta, Bandung, Surabaya, Semarang, Medan, etc. |
| Users | 10+ | Admin, Regional Admins, Officers, Supervisor |
| Loan Products | 6 | Various micro-loan products |
| Members | 15+ | Test members |
| Loan Applications | 13+ | Various statuses |
| Installments | 83+ | Payment schedules |
| Collections | 83+ | Payment records |

### Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@kopimas.com | password123 | System Admin |
| admin.jabar@kopimas.com | password123 | Regional Admin |
| officer.jkt1@kopimas.com | password123 | Officer |
| supervisor@kopimas.com | password123 | Supervisor |

---

## API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI:** http://localhost:3000/api/docs
- **OpenAPI JSON:** http://localhost:3000/api/docs-json

### Main Endpoints

| Module | Base Path | Description |
|--------|-----------|-------------|
| Authentication | `/api/v1/auth` | Login, refresh token |
| Users | `/api/v1/users` | User management |
| Members | `/api/v1/members` | Member CRUD |
| Loan Applications | `/api/v1/loan-applications` | Application management |
| Loan Products | `/api/v1/loan-products` | Product configuration |
| Field Verifications | `/api/v1/field-verifications` | Verification workflows |
| Disbursements | `/api/v1/disbursements` | Fund disbursement |
| Collections | `/api/v1/collections` | Payment collection |
| Installments | `/api/v1/installments` | Payment schedules |
| Branches | `/api/v1/branches` | Branch management |
| Regions | `/api/v1/regions` | Regional management |
| Reports | `/api/v1/reports` | Analytics & reporting |
| Dashboard | `/api/v1/dashboard` | Dashboard data |
| Virtual Accounts | `/api/v1/virtual-accounts` | Payment accounts |

### Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

---

## Project Structure

### Backend Structure

```
kopi-mas-backend/
├── src/
│   ├── common/                  # Shared utilities
│   │   ├── decorators/          # Custom decorators
│   │   └── filters/             # Exception filters
│   ├── config/                  # Configuration
│   ├── database/                # Database setup
│   │   ├── migrations/          # TypeORM migrations
│   │   └── datasource.ts        # Data source config
│   ├── modules/                 # Feature modules
│   │   ├── auth/                # Authentication
│   │   ├── users/               # User management
│   │   ├── members/             # Member management
│   │   ├── loan-applications/   # Loan applications
│   │   ├── loan-products/      # Loan products
│   │   ├── field-verifications/# Field verifications
│   │   ├── disbursements/      # Disbursements
│   │   ├── collections/         # Collections
│   │   ├── installments/        # Installments
│   │   ├── branches/            # Branch management
│   │   ├── regions/             # Regional management
│   │   ├── reports/             # Reporting
│   │   ├── dashboard/           # Dashboard data
│   │   ├── notifications/       # Notifications
│   │   ├── upload/              # File uploads
│   │   ├── audit-logs/          # Audit logging
│   │   ├── virtual-accounts/   # Virtual accounts
│   │   └── integrations/        # Third-party integrations
│   └── main.ts                  # Application entry
├── test/                        # Test files
├── docker-compose.yml           # Docker services
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
└── .env.example                # Environment template
```

### Admin Structure

```
kopi-mas-admin/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (dashboard)/         # Protected routes
│   │   │   ├── dashboard/      # Dashboard page
│   │   │   ├── members/        # Member management
│   │   │   ├── applications/   # Loan applications
│   │   │   ├── loans/          # Loan management
│   │   │   ├── collections/    # Collections
│   │   │   ├── verifications/  # Field verifications
│   │   │   ├── products/       # Loan products
│   │   │   ├── branches/       # Branch management
│   │   │   ├── regions/        # Regional management
│   │   │   ├── users/          # User management
│   │   │   └── reports/        # Reports
│   │   └── login/              # Authentication
│   ├── components/             # React components
│   │   ├── ui/                 # UI primitives (Shadcn)
│   │   ├── layout/             # Layout components
│   │   └── features/           # Feature-specific components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities
│   │   ├── api.ts              # API client
│   │   ├── utils.ts            # Helper functions
│   │   └── i18n/               # Internationalization
│   └── store/                  # Zustand stores
├── public/                     # Static assets
├── package.json                # Dependencies
├── next.config.js             # Next.js config
├── tailwind.config.ts         # Tailwind CSS config
└── tsconfig.json             # TypeScript config
```

### Mobile App Structure

```
kopi-mas-officer/
├── lib/
│   ├── core/                   # Foundation
│   │   ├── constants/          # API endpoints, keys
│   │   ├── database/          # Drift database
│   │   ├── network/           # Dio client, GoRouter
│   │   └── theme/             # Material theme
│   ├── features/              # Business features
│   │   ├── auth/              # Authentication
│   │   ├── members/           # Member management
│   │   ├── loans/             # Loan management
│   │   ├── verification/      # Field verification
│   │   ├── collections/       # Payment collections
│   │   ├── installments/      # Installment tracking
│   │   ├── notifications/     # Push notifications
│   │   ├── profile/           # User profile
│   │   └── dashboard/         # Dashboard
│   └── shared/                # Cross-feature utilities
│       ├── models/            # Domain models (Freezed)
│       └── widgets/           # Reusable widgets
├── test/                      # Test files
├── pubspec.yaml               # Flutter dependencies
└── .gitignore                 # Git ignore rules
```

---

## Development Commands

### Backend Commands

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start:prod` | Run production build |
| `npm run lint` | Run ESLint with auto-fix |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage report |
| `npm run seed:all` | Seed database with test data |

### Admin Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |

### Mobile Commands

| Command | Description |
|---------|-------------|
| `flutter pub get` | Install dependencies |
| `flutter run` | Run on connected device/emulator |
| `flutter run -d <device>` | Run on specific device |
| `flutter build apk` | Build debug APK |
| `flutter build apk --release` | Build release APK |
| `flutter build ios` | Build for iOS |
| `dart run build_runner build` | Generate code |

---

## Testing

### Backend Testing

```bash
cd applications/kopi-mas-backend

# Run all tests
npm run test

# Run with coverage
npm run test:cov

# Run specific test file
npm run test -- --testPathPattern=users.service.spec.ts

# Run in watch mode
npm run test:watch
```

### Writing Tests

Tests are located in the `test/` directory:

- `test/unit/` - Unit tests for services
- `test/integration/` - Integration tests
- `test/e2e/` - End-to-end tests

Example test structure:

```typescript
// test/unit/users.service.spec.ts
describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

---

## Deployment

### Backend Deployment

#### Using Docker

```bash
cd applications/kopi-mas-backend

# Build image
docker build -t credina-api:latest .

# Run container
docker run -d -p 3000:3000 --env-file .env credina-api:latest
```

#### Using Docker Compose (Production)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api:
    build: ./kopi-mas-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
```

### Admin Deployment

```bash
cd applications/kopi-mas-admin

# Build for production
npm run build

# Start production server
npm run start
```

### Mobile App Build

```bash
cd applications/kopi-mas-officer

# Build release APK
flutter build apk --release

# Build for iOS (requires macOS)
flutter build ios --release

# Build App Bundle for Play Store
flutter build appbundle --release
```

---

## Contributing

We welcome contributions to Credina! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/credina.git`
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Make your changes and commit: `git commit -m 'Add amazing feature'`
5. Push to your fork: `git push origin feature/amazing-feature`
6. Create a Pull Request

### Code Standards

- Follow the existing code style and conventions
- Write clean, maintainable code
- Add comments for complex logic
- Update documentation for any changes
- Write tests for new features

### Submitting Pull Requests

1. Ensure all tests pass
2. Update the README if needed
3. Describe your changes in the PR description
4. Request review from maintainers

---

## Security

### Security Best Practices

- **Never commit secrets** - Use environment variables
- **Validate input** - Use class-validator on all DTOs
- **Sanitize output** - Prevent XSS attacks
- **Use parameterized queries** - Prevent SQL injection
- **Implement rate limiting** - Prevent brute force attacks
- **Keep dependencies updated** - Security patches

### Reporting Security Issues

If you find a security vulnerability, please report it by email to security@credina.id rather than using the public issue tracker.

---

## License

This project is proprietary software. All rights reserved.

See the [LICENSE](LICENSE) file for more details.

---

## Support

### Getting Help

- **Documentation:** Check the README files in each application
- **API Docs:** Visit http://localhost:3000/api/docs (when running locally)
- **Issues:** Report bugs and request features on GitHub

### Contact

- Email: support@credina.id
- Website: https://credina.id

---

## Acknowledgments

- [NestJS](https://nestjs.com/) - The progressive Node.js framework
- [Next.js](https://nextjs.org/) - The React Framework
- [Flutter](https://flutter.dev/) - Build beautiful native apps
- [Shadcn UI](https://ui.shadcn.com/) - Beautiful and accessible components
- [TypeORM](https://typeorm.io/) - ORM for TypeScript

---

<p align="center">
  <strong>Made with ❤️ by the Credina Team</strong>
</p>
