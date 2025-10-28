# Testing Guide

## Frontend (Next.js)

- Unit tests:
  - Location: `frontend/src/**/__tests__/**` and `frontend/src/**/*.(test|spec).(ts|tsx)`
  - Excludes: `frontend/src/__tests__/integration/**`
  - Run: `npm run test:unit` (inside `frontend/`)
  - CI: `npm run test:unit:ci` (with coverage, no watch)

- Integration tests:
  - Location: `frontend/src/__tests__/integration/**`
  - Run: `npm run test:integration`
  - CI: `npm run test:integration:ci` (with coverage, no watch)

- E2E (Playwright):
  - Location: `frontend/tests/**`
  - Run: `npm run test:e2e`

Common:
- All Jest tests: `npm test`
- All tests (CI): `npm run test:ci` (includes structure verification)
- Coverage: `npm run test:coverage`
- Verify structure: `npm run test:verify-structure`

## Backend (Express)

- Unit tests:
  - Location: `backend/src/**/__tests__/unit/**` and standard `*.test.js|*.spec.js` outside `integration`
  - Run: `npm run test:unit` (inside `backend/`)
  - CI: `npm run test:unit:ci` (with coverage, no watch)

- Integration tests:
  - Location: `backend/src/__tests__/integration/**`
  - Run: `npm run test:integration`
  - CI: `npm run test:integration:ci` (with coverage, no watch)

Common:
- All Jest tests: `npm test`
- All tests (CI): `npm run test:ci` (with coverage, no watch)
- Coverage: `npm run test:coverage`

## CI/CD Workflows

### GitHub Actions

- `unit-tests.yml` - รัน unit tests ทั้ง frontend และ backend
- `integration-tests.yml` - รัน integration tests ทั้ง frontend และ backend (พร้อม PostgreSQL service)
- `e2e-tests.yml` - รัน E2E tests ด้วย Playwright
- `lint.yml` - รัน ESLint และตรวจสอบโครงสร้าง test

ทุก workflow รันอัตโนมัติเมื่อ push หรือ PR ไปยัง `main`, `master`, หรือ `develop` branches

### Jenkins Pipeline

Jenkinsfile ประกอบด้วย stages ดังนี้:
1. **Checkout** - ดึง source code
2. **Build & Lint Parallel** - ติดตั้ง dependencies และ lint ทั้ง frontend/backend พร้อมกัน พร้อมตรวจสอบโครงสร้าง test
3. **Unit Tests** - รัน unit tests ทั้ง frontend/backend แบบ parallel พร้อม publish coverage reports
4. **Integration Tests** - รัน integration tests (เฉพาะ main/develop/PR) พร้อม database credentials
5. **E2E Tests** - รัน Playwright E2E tests (เฉพาะ main/develop) พร้อม publish HTML report
6. **Deploy to Coolify** - deploy ตาม branch (main → production, develop → development)

**Jenkins Credentials ที่ต้องตั้งค่า:**
- `TEST_DATABASE_URL` - Database URL สำหรับ integration tests
- `TEST_JWT_SECRET` - JWT secret สำหรับ testing
- `TEST_JWT_REFRESH_SECRET` - JWT refresh secret สำหรับ testing

## Notes
- Frontend Jest is configured to ignore `frontend/tests/` (Playwright) automatically.
- Backend uses Node test environment; add libraries like `supertest` for HTTP tests as needed.
- Policy: Integration tests ต้องอยู่ใต้ `frontend/src/__tests__/integration/` และต้องใช้ suffix `.integration.test.*` เท่านั้น (มีสคริปต์ตรวจสอบ)
- Coverage reports จะถูก upload ไปยัง Codecov (ต้องตั้งค่า `CODECOV_TOKEN` secret ใน GitHub repository)
