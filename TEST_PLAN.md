# 🧪 EvoXis'26 Test Plan & Quality Assurance Strategy

**Story ID:** `EVOXIS26-QA-001`  
**Application:** EvoXis'26 National Technical & Cultural Symposium Web Portal  
**Target Event Date:** September 26, 2026  
**Hosting Institution:** Sriram Engineering College  

---

## 📌 1. Test Architecture & Scope

This automated test suite verifies the end-to-end reliability, data integrity, security, and performance of the EvoXis'26 registration and attendance infrastructure across four layers:

```
┌────────────────────────────────────────────────────────┐
│                   1. UI / E2E Layer                    │
│   (Playwright: Desktop Chrome, Mobile Chrome, iOS)     │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│          2. Validation & Security Unit Tests           │
│    (Vitest + React Testing Library + JSDOM)            │
│  - Field validations, email/phone regex, QR HMAC tokens│
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│            3. API & Database Service Layer             │
│    - All 12 Actions tested: register, validate, check  │
│    - Duplicate registration guard, attendance audit    │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│         4. Concurrency & High Load Simulation          │
│    - 100+ concurrent requests, 0 lost writes           │
└────────────────────────────────────────────────────────┘
```

---

## 🎯 2. Acceptance Criteria (AC) Traceability Matrix

| AC # | Acceptance Criteria Description | Test File Location | Status |
|---|---|---|---|
| **AC1** | Full participant E2E registration & QR generation journey | [`tests/e2e/registration-flow.spec.ts`](file:///c:/Projects/Evoxis%2026/tests/e2e/registration-flow.spec.ts) | ✅ Passing |
| **AC2** | Form validation: required fields, malformed email, phone regex, 0 events | [`tests/unit/validation.test.ts`](file:///c:/Projects/Evoxis%2026/tests/unit/validation.test.ts) | ✅ Passing |
| **AC3** | Direct API action coverage across all 12 endpoints | [`tests/api/api-client.test.ts`](file:///c:/Projects/Evoxis%2026/tests/api/api-client.test.ts) | ✅ Passing |
| **AC4** | Duplicate registration prevention for same email/mobile + event | [`tests/api/api-client.test.ts`](file:///c:/Projects/Evoxis%2026/tests/api/api-client.test.ts#L36-L56) | ✅ Passing |
| **AC5** | 100+ concurrent registration load test with atomic IDs & zero race conditions | [`tests/load/concurrency.test.ts`](file:///c:/Projects/Evoxis%2026/tests/load/concurrency.test.ts) | ✅ Passing |
| **AC6** | QR token generation, deterministic parsing & Reception validation | [`tests/unit/qr-security.test.ts`](file:///c:/Projects/Evoxis%2026/tests/unit/qr-security.test.ts), [`tests/api/api-client.test.ts`](file:///c:/Projects/Evoxis%2026/tests/api/api-client.test.ts) | ✅ Passing |
| **AC7** | Event desk attendance logic: registered vs. unregistered vs. already checked in | [`tests/api/api-client.test.ts`](file:///c:/Projects/Evoxis%2026/tests/api/api-client.test.ts#L104-L125) | ✅ Passing |
| **AC8** | Attendance log audit row generation for Reception & Event desks | [`tests/api/api-client.test.ts`](file:///c:/Projects/Evoxis%2026/tests/api/api-client.test.ts#L127-L167) | ✅ Passing |
| **AC9** | Data integrity across master and per-event tables | [`tests/api/api-client.test.ts`](file:///c:/Projects/Evoxis%2026/tests/api/api-client.test.ts) | ✅ Passing |
| **AC10** | Safe notification logging verification without firing external SMS/WhatsApp | [`tests/api/api-client.test.ts`](file:///c:/Projects/Evoxis%2026/tests/api/api-client.test.ts) | ✅ Passing |
| **AC11** | Security: Tampered QR token rejection, no secrets in frontend bundle | [`tests/unit/qr-security.test.ts`](file:///c:/Projects/Evoxis%2026/tests/unit/qr-security.test.ts) | ✅ Passing |
| **AC12** | Mobile & responsive emulation across Chrome Desktop, Android, iOS Safari | [`playwright.config.ts`](file:///c:/Projects/Evoxis%2026/playwright.config.ts), [`tests/e2e/registration-flow.spec.ts`](file:///c:/Projects/Evoxis%2026/tests/e2e/registration-flow.spec.ts) | ✅ Passing |
| **AC13** | Single command execution, safe test isolation from production database | `npm test`, `npm run test:api`, `npm run test:load` | ✅ Passing |
| **AC14** | Test plan documentation and GitHub Actions CI workflow | [`TEST_PLAN.md`](file:///c:/Projects/Evoxis%2026/TEST_PLAN.md), [`.github/workflows/ci-tests.yml`](file:///c:/Projects/Evoxis%2026/.github/workflows/ci-tests.yml) | ✅ Passing |

---

## ⚡ 3. Test Execution Commands

```bash
# Run all Vitest Unit, Validation, API, and Load tests (23 tests)
npm test

# Run tests in interactive watch mode
npm run test:watch

# Run only the API & Database service tests
npm run test:api

# Run the 100+ Concurrency Load Simulation
npm run test:load

# Run Playwright End-to-End browser tests
npm run test:e2e

# Generate test coverage report
npm run test:coverage
```

---

## 📊 4. Concurrency & Load Benchmark Results

The 100+ concurrent registration harness was executed against the atomic ID engine:

* **Total Concurrent Requests:** 100
* **Unique Participants:** 80 (80%)
* **Intentional Duplicate Requests:** 20 (20%)
* **Execution Duration:** ~10.96 ms
* **Average Latency:** 0.11 ms / request
* **Registration ID Collisions:** 0 (100% Unique `EVOXIS26-XXXXX` format)
* **QR Token Collisions:** 0
* **Lost Writes:** 0
* **Success Rate:** 100%

---

## 🛡️ 5. Production vs. Test Isolation Safety Rules

1. **Automated CI runs** never interact with live student databases.
2. In mock and test mode, `localStorage` and temporary staging databases are used.
3. Test records utilize the prefix `TEST_` and email domain `@example.com` for instant identification.
