# SKILLS.md

## Available Skills

This document defines specialized skills and capabilities available for the Kopi Mas Backend development.

### 1. NestJS Development

**Description:** Expert-level NestJS framework skills for building scalable Node.js applications.

**Capabilities:**
- Module creation and organization
- Controller and service development
- Dependency injection patterns
- Middleware and guard implementation
- Exception filtering
- Pipes and decorators

**Usage:** Use for any backend API development using NestJS.

---

### 2. TypeORM & PostgreSQL

**Description:** Database design and query optimization using TypeORM with PostgreSQL.

**Capabilities:**
- Entity modeling with relationships
- Migrations management
- Query builder usage
- Transaction handling
- Soft deletes
- Index optimization

**Usage:** Use for all database-related operations and schema design.

---

### 3. JWT Authentication

**Description:** Implementation of secure authentication using JWT tokens.

**Capabilities:**
- Passport JWT strategy
- Token generation and validation
- Refresh token handling
- Role-based access control (RBAC)
- Guard implementation

**Usage:** Use for implementing authentication and authorization.

---

### 4. API Documentation (Swagger)

**Description:** RESTful API documentation using Swagger/OpenAPI.

**Capabilities:**
- @ApiTags, @ApiOperation, @ApiResponse decorators
- DTO documentation
- Authentication documentation
- Request/Response schemas

**Usage:** Use for documenting all API endpoints.

---

### 5. File Handling (MinIO/S3)

**Description:** File upload and storage using MinIO (S3-compatible).

**Capabilities:**
- Multer configuration for file uploads
- MinIO client integration
- Bucket management
- Presigned URL generation

**Usage:** Use for document uploads, image handling, and file storage.

---

### 6. SMS Notifications (Twilio)

**Description:** SMS notification sending using Twilio API.

**Capabilities:**
- Twilio client configuration
- SMS message sending
- Phone number validation

**Usage:** Use for sending SMS notifications to members.

---

### 7. Testing (Jest)

**Description:** Unit and integration testing using Jest.

**Capabilities:**
- Service unit testing
- Controller testing
- Mocking repositories
- Testing guards and decorators
- Coverage reports

**Usage:** Use for writing tests to ensure code quality.

---

### 8. Code Quality (ESLint)

**Description:** Code linting and formatting standards.

**Capabilities:**
- TypeScript linting
- Auto-fix on save
- Prettier integration

**Usage:** Use `npm run lint` to check and fix code style issues.

---

## Skill Selection Guide

| Task Type | Recommended Skill |
|-----------|-------------------|
| Create new API endpoint | NestJS Development + TypeORM & PostgreSQL |
| Add authentication | JWT Authentication |
| Document API | API Documentation (Swagger) |
| Handle file upload | File Handling (MinIO/S3) |
| Send SMS notification | SMS Notifications (Twilio) |
| Write tests | Testing (Jest) |
| Fix code style | Code Quality (ESLint) |

---

## Quick Reference

### Running Development Server
```bash
npm run start:dev
```

### Running Tests
```bash
npm run test
npm run test:watch
npm run test:cov
```

### Linting
```bash
npm run lint
```

### Database Migrations
```bash
npm run typeorm migration:generate -- -d src/database/datasource.ts MigrationName
npm run typeorm migration:run -- -d src/database/datasource.ts
```

### Seeding Data
```bash
npm run seed:superadmin
npm run seed:all
```

---

*Use these skills in combination as needed for your development tasks.*
