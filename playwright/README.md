# E2E Test Framework

Playwright-based E2E testing for the dev-calendar monorepo.

## Setup

```bash
# Install dependencies (from monorepo root)
pnpm add -D @playwright/test @seontechnologies/playwright-utils @faker-js/faker dotenv

# Install browsers
npx playwright install --with-deps
```

Copy `.env.example` to `.env` and configure as needed.

## Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run in headed mode (see the browser)
pnpm test:e2e -- --headed

# Run specific test file
pnpm test:e2e -- playwright/e2e/example.spec.ts

# Run with UI mode (interactive debugging)
npx playwright test --ui

# Run specific project (browser)
pnpm test:e2e -- --project=chromium

# Debug a single test
npx playwright test --debug playwright/e2e/example.spec.ts
```

## Architecture

```
playwright/
├── config/
│   └── base.config.ts          # Shared Playwright config (timeouts, reporters, projects)
├── e2e/                        # E2E test files (*.spec.ts)
│   ├── example.spec.ts         # Sample calendar event tests
│   └── api-health.spec.ts      # API-only health check
└── support/
    ├── merged-fixtures.ts      # Fixture composition via mergeTests
    ├── factories/              # Data factories (faker-based, override pattern)
    │   └── event-factory.ts    # CalendarEvent factory
    ├── helpers/                # Reusable test utilities
    │   ├── seed-helpers.ts     # API data seeding
    │   ├── auth-helpers.ts     # Authentication helpers
    │   └── network-helpers.ts  # Network interception patterns
    └── page-objects/           # Page Object Models (future)
```

### Key Patterns

- **Merged Fixtures**: Import `test` and `expect` from `support/merged-fixtures.ts` in all tests. This provides `apiRequest`, `authToken`, `recurse`, `log`, and `interceptNetworkCall` fixtures.
- **Data Factories**: Use `createCalendarEvent()` with overrides instead of hardcoded data. Factories generate unique values via faker for parallel-safe tests.
- **API Seeding**: Seed test data through API calls, not UI interactions. Use `seedEvent()` helpers.
- **Network Interception**: Set up intercepts before navigation. Use Given/When/Then format.

## Best Practices

- Use `data-testid` attributes for selectors (resilient to UI changes)
- Isolate tests: each test creates its own data, cleans up after
- No shared mutable state between tests
- Intercept network calls before navigation (not after)
- Import `test` from merged-fixtures, not from `@playwright/test` directly

## CI Integration

Tests run in GitHub Actions CI. Key settings:
- `forbidOnly: true` in CI (prevents `.only()` from blocking pipeline)
- 2 retries in CI, 0 locally
- 1 worker in CI (stability), auto locally (speed)
- Artifacts (screenshots, traces, video) uploaded on failure

## Reports

After running tests:
- HTML report: `playwright-report/` (run `npx playwright show-report`)
- JUnit XML: `test-results/results.xml`

## Troubleshooting

**Config TypeScript errors**: Ensure `@playwright/test` is installed (`pnpm add -D @playwright/test`)

**Sample test fails**: Check `BASE_URL` in `.env` and ensure the app is running (`pnpm dev`)

**Network interception not working**: Ensure intercept is set up *before* `page.goto()` — see `intercept-network-call` patterns

**Browser not found**: Run `npx playwright install --with-deps` to install browser binaries

## Knowledge Base

Framework patterns from `@seontechnologies/playwright-utils`:
- Fixture composition with `mergeTests`
- API-first data setup (seed via API, validate via UI)
- Network interception with glob patterns
- Auth session persistence with disk caching
