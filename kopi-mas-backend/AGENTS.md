# AGENTS.md

## 🤖 AI Agent Role & Context
You are an expert Senior Backend Engineer specializing in **NestJS**, **TypeORM**, and **PostgreSQL**. You are building the "Kopi Mas Backend," a cooperative lending platform API that handles member management, loan applications, disbursements, collections, and financial reporting.

## 🛠 Tech Stack Context
*   **Framework:** NestJS 10.x
*   **Database:** PostgreSQL with TypeORM
*   **Authentication:** JWT (Passport.js)
*   **Validation:** class-validator + class-transformer
*   **API Documentation:** Swagger (NestJS Swagger)
*   **File Storage:** MinIO (S3-compatible)
*   **Notifications:** Twilio (SMS)
*   **Password Hashing:** bcryptjs
*   **Testing:** Jest

---

## 🏗 Architectural Patterns

### 1. Module Structure
Each feature follows NestJS module pattern:
```
modules/[feature-name]/
├── controllers/[feature].controller.ts
├── services/[feature].service.ts
├── entities/[feature].entity.ts
├── dto/[feature].dto.ts
└── [feature].module.ts
```

### 2. Entity Design
*   Use TypeORM decorators (`@Entity`, `@Column`, `@PrimaryGeneratedColumn`, etc.)
*   Always define relationships with `@OneToMany`, `@ManyToOne`, `@JoinColumn`
*   Use UUID for primary keys (`@PrimaryGeneratedColumn('uuid')`)
*   Include `createdAt` and `updatedAt` timestamps using `@CreateDateColumn` and `@UpdateDateColumn`
*   Use `SoftDelete` for soft deletes (import from typeorm)

### 3. Service Layer
*   Business logic goes in services
*   Use TypeORM repository pattern: `this.[entityName]Repository`
*   Implement helper services in `*-helpers.service.ts` for complex business logic
*   Always handle transactions for multi-table operations using `DataSource.transaction()`

### 4. Controller Layer
*   Use `@Controller()` decorator
*   Define routes with `@Get()`, `@Post()`, `@Put()`, `@Delete()`, `@Patch()`
*   Use `@Body()`, `@Param()`, `@Query()` for request data
*   Apply `@UseGuards(JwtAuthGuard)` for protected routes
*   Use `@Roles()` decorator for role-based access control
*   Use Swagger decorators: `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()`, `@ApiBearerAuth()`

### 5. DTO (Data Transfer Objects)
*   Use `class-validator` decorators: `@IsString()`, `@IsNumber()`, `@IsEmail()`, `@IsOptional()`, `@Min()`, `@Max()`, etc.
*   Use `class-transformer` decorators: `@Transform()` for type conversion
*   Create separate DTOs for: Create, Update, and Response
*   Use Swagger decorators in DTOs: `@ApiProperty()`, `@ApiPropertyOptional()`

---

## 📝 Coding Standards

### TypeScript
*   Strict mode enabled. No `any`.
*   Use `interface` for object definitions, `type` for unions/intersections.
*   Use `PartialType()`, `PickType()`, `OmitType()` from `@nestjs/swagger` for DTO inheritance.

### Naming Conventions
*   **Controllers:** PascalCase (e.g., `MembersController`)
*   **Services:** PascalCase (e.g., `MembersService`)
*   **Entities:** PascalCase (e.g., `MemberEntity`)
*   **DTOs:** PascalCase (e.g., `CreateMemberDto`)
*   **Helpers:** PascalCase (e.g., `MemberHelpersService`)

### Repository Pattern
```typescript
// In service
constructor(
  @InjectRepository(MemberEntity)
  private readonly memberRepository: Repository<MemberEntity>,
) {}
```

### Error Handling
*   Use NestJS built-in exceptions: `NotFoundException`, `BadRequestException`, `ForbiddenException`, `UnauthorizedException`
*   Throw `NotFoundException` for non-existent resources
*   Throw `BadRequestException` for validation errors

---

## 🚀 Step-by-Step Implementation Guide

### Creating a New Module
1.  **Create Entity:** Define in `src/modules/[feature]/entities/[feature].entity.ts`
2.  **Create DTOs:** Define in `src/modules/[feature]/dto/[feature].dto.ts`
3.  **Create Service:** Implement business logic in `src/modules/[feature]/services/[feature].service.ts`
4.  **Create Controller:** Define API endpoints in `src/modules/[feature]/controllers/[feature].controller.ts`
5.  **Create Module:** Register in `src/modules/[feature]/[feature].module.ts`
6.  **Register in AppModule:** Add to `src/app.module.ts` imports

### Creating Migrations
```bash
npm run typeorm migration:generate -- -d src/database/datasource.ts src/database/migrations/Create[TableName]Table
npm run typeorm migration:run -- -d src/database/datasource.ts
```

### Adding Tests
*   Unit tests go in `test/unit/`
*   Follow naming pattern: `[feature].service.spec.ts`
*   Use `TestingModule` from `@nestjs/testing`

---

## ⚠️ Anti-Patterns to Avoid
*   ❌ **Do not** put business logic in controllers; delegate to services.
*   ❌ **Do not** use raw SQL queries unless absolutely necessary; use TypeORM query builder.
*   ❌ **Do not** expose database entities directly in API responses; use DTOs.
*   ❌ **Do not** hardcode configuration values; use `configuration.ts` and environment variables.
*   ❌ **Do not** forget to handle async operations with proper try-catch.
*   ❌ **Do not** use `any` type; always define proper types.

---

## 🛠 Command Shortcuts
*   `npm run start`: Start production server.
*   `npm run start:dev`: Start development server with hot reload.
*   `npm run build`: Build for production.
*   `npm run lint`: Run ESLint with auto-fix.
*   `npm run test`: Run Jest tests.
*   `npm run seed:superadmin`: Seed superadmin user.
*   `npm run seed:all`: Seed all initial data.

---

## 📚 Key Modules Reference

| Module | Purpose |
|--------|---------|
| `auth` | JWT authentication, login, guards |
| `users` | Admin/user management |
| `members` | Cooperative member management |
| `loan-applications` | Loan application processing |
| `loan-products` | Loan product configurations |
| `loan-documents` | Document uploads and management |
| `field-verifications` | Field verification workflows |
| `disbursements` | Loan disbursement processing |
| `collections` | Payment collection tracking |
| `installments` | Installment schedule management |
| `branches` | Branch office management |
| `regions` | Regional management |
| `reports` | Financial and operational reports |
| `dashboard` | Dashboard data aggregation |
| `notifications` | SMS/notification sending (Twilio) |
| `upload` | File upload handling (MinIO) |
| `audit-logs` | System audit logging |
| `integrations` | Third-party integrations |
| `virtual-accounts` | Virtual account management |
| `credit-scoring` | Credit scoring logic |
| `approval-workflows` | Approval workflow automation |

---

## 🔗 Response Normalization & Relation Handling

### Principle
All endpoints MUST return **frontend-friendly, human-readable relational data**, not just foreign keys.

Avoid exposing only IDs when a meaningful label exists.

---

### 1. Relation Resolution Strategy

For entities with relations (e.g., ManyToOne, OneToMany):

#### ❌ Avoid:
```json
{
  "id": "loan-123",
  "memberId": "member-456"
}
```

#### ✅ Prefer:
```json
{
  "id": "loan-123",
  "member": {
    "id": "member-456",
    "name": "John Doe"
  }
}
```

---

### Example: Loan Application → Member

**Entity Relationship:**
- `LoanApplication` → `ManyToOne` → `Member`

**API Response MUST be:**
```json
{
  "id": "...",
  "member": {
    "id": "...",
    "name": "..."
  }
}
```

### 2. DTO Design for Relations

Always create Response DTOs with nested objects:

```typescript
export class MemberSummaryDto {
  id: string;
  name: string;
}

export class LoanApplicationResponseDto {
  id: string;

  member: MemberSummaryDto;
}
```
### 3. Service Layer: Relation Loading

Always load relations explicitly:

```typescript
const loan = await this.loanRepository.find({
  relations: ['member'],
});
```

OR using QueryBuilder:

```query
.createQueryBuilder('loan')
.leftJoinAndSelect('loan.member', 'member')
```

### 4. Mapping Layer (MANDATORY)

NEVER return entities directly. Always map:

```typescript
return loans.map((loan) => ({
  id: loan.id,
  member: {
    id: loan.member.id,
    name: loan.member.name,
  },
}));
```

### 5. Standard: Summary vs Full Object

Use lightweight nested objects:

|Context	|DTO |
|List view	|Summary DTO (id, name)|
|Detail view	|Full DTO|

### 6. Naming Convention
|Field	|Rule|
|Foreign key	|memberId (internal only)|
|Response object	|member (external API)|


---

*Reference this document for every code generation task to ensure the project remains professional, maintainable, and aligned with Kopi Mas standards.*
