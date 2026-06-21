# Playwright Multi-Environment Framework

A production-grade Playwright framework featuring:

- 🌍 **Multi-environment config** (`dev.env`, `stag.env`, `prod.env`) — switch with one variable
- 🔀 **Separated API & UI projects** — independent speed, parallelism, and reporting
- 🔐 **Login-once architecture** — UI auth runs once per suite via `storageState`, not per test
- 🧩 **Page Object Model** for UI, **Endpoint classes** for API
- 🧪 **Fixtures** that auto-inject page objects / API clients / auth tokens
- 🛡️ **Fail-fast env validation** with CI-secret placeholder resolution for prod
- 🤖 **GitHub Actions CI** running a dev/stag/prod matrix

This project is wired against two **real, public, stable** endpoints so it runs out of the box with zero setup:
- UI: [practicetestautomation.com/practice-test-login](https://practicetestautomation.com/practice-test-login/) (a purpose-built login QA sandbox)
- API: [reqres.in](https://reqres.in) (a public REST test API)

Swap these for your real app in the `env/*.env` files — nothing else changes.

---

## 1. Install

```bash
npm install
npx playwright install --with-deps
```

## 2. Run tests

```bash
# Full suite (API + UI, all browsers) against a given environment
npm run test:dev
npm run test:stag
npm run test:prod

# Just the API project
npm run test:api          # defaults to stag
npm run test:api:dev
npm run test:api:prod

# Just UI, Chromium only
npm run test:ui           # defaults to stag
npm run test:ui:dev
npm run test:ui:prod

# UI across Chromium + Firefox + WebKit
npm run test:ui:all-browsers

# Headed / debug
npm run test:headed
npm run test:debug

# View the HTML report after a run
npm run report
```

Under the hood every script just sets `ENV` and runs `playwright test`:

```bash
cross-env ENV=stag playwright test --project=api
```

You can always run this manually with any project/grep combination:

```bash
ENV=prod npx playwright test --project=ui-chromium --grep "login"
```

---

## 3. How environment switching works

```
env/
├── dev.env
├── stag.env
├── prod.env
└── .env.example   ← committed template; real .env files are gitignored
```

`config/env.config.ts` is a **singleton loader**:

1. Reads `process.env.ENV` (`dev` | `stag` | `prod`) — throws immediately if missing or invalid.
2. Loads `env/<ENV>.env`.
3. Resolves any `${VAR_NAME}` placeholders against real environment variables — this is how `prod.env` keeps secrets out of git while still being a normal-looking env file (see step 6).
4. Validates that every required key is present — throws naming the exact missing key.
5. Exports one frozen `envConfig` object, imported everywhere: `playwright.config.ts`, fixtures, page objects, tests.

This means **one source of truth**. Nothing in the framework reads `process.env.X` directly except this file.

---

## 4. Project architecture (`playwright.config.ts`)

| Project | Purpose | Auth state |
|---|---|---|
| `api` | All API tests. No browser. Fastest, runs in parallel with everything else. | API login per-test via fixture/token, not storageState |
| `setup` | Runs `tests/ui/auth.setup.ts` once. Logs in through the real UI and saves `storageState`. | — |
| `ui-chromium` / `ui-firefox` / `ui-webkit` | Authenticated UI tests. Depend on `setup`, so it always runs first and only once. | Injected via `storageState: auth/<env>.json` |
| `ui-unauthenticated` | UI tests that must start logged-out (e.g. testing the login form itself). | None — fresh browser context |

**Why this matters:** logging in through the UI is slow and the least reliable part of any suite. Doing it once per run (not once per test file) is the single biggest reliability/speed improvement you can make to a Playwright suite. The `dependencies: ['setup']` mechanism plus Playwright's built-in setup caching means this happens exactly once even with hundreds of UI tests across 3 browsers.

`storageState` files are named **per environment** (`auth/dev.json`, `auth/stag.json`, `auth/prod.json`) so switching `ENV` can never reuse a stale session from another environment.

---

## 5. Folder structure

```
├── env/                        # per-environment variables (gitignored except .env.example)
├── config/
│   └── env.config.ts           # the one place that reads .env files
├── src/
│   ├── api/
│   │   ├── clients/api-client.ts       # thin wrapper over Playwright's APIRequestContext
│   │   └── endpoints/                  # one class per resource (auth, users, ...)
│   ├── ui/
│   │   ├── pages/                      # Page Object Model — base.page.ts + per-page classes
│   │   └── components/                 # reusable UI fragments (nav bars, modals, etc.)
│   ├── fixtures/
│   │   ├── api.fixture.ts              # apiClient, authEndpoints, usersEndpoints, authToken
│   │   ├── ui.fixture.ts               # loginPage, dashboardPage, ...
│   │   └── merged.fixture.ts           # combined, for tests needing both API + UI
│   └── utils/logger.ts
├── tests/
│   ├── api/                    # *.api.spec.ts
│   └── ui/
│       ├── auth.setup.ts       # the one-time UI login
│       ├── *.ui.spec.ts        # authenticated UI tests
│       └── *.unauth.spec.ts    # logged-out UI tests
├── auth/                       # generated storageState JSON, one per env (gitignored)
├── global-setup.ts             # logs run context, ensures auth/ exists
├── playwright.config.ts
└── .github/workflows/playwright.yml
```

---

## 6. Secrets & CI

Real `env/*.env` files (containing real credentials) are **never committed** — only `env/.env.example` is. For `prod`, the recommended pattern is to commit placeholders and resolve them from CI secrets at runtime:

```env
# env/prod.env
USER_PASSWORD=${PROD_USER_PASSWORD}
API_KEY=${PROD_API_KEY}
```

`env.config.ts` automatically resolves `${PROD_USER_PASSWORD}` against `process.env.PROD_USER_PASSWORD`. In CI (see `.github/workflows/playwright.yml`), that's injected from GitHub Actions secrets:

```yaml
- name: Create env file from CI secrets (prod only)
  if: matrix.env == 'prod'
  run: |
    echo "PROD_USER_PASSWORD=${{ secrets.PROD_USER_PASSWORD }}" >> $GITHUB_ENV
    echo "PROD_API_KEY=${{ secrets.PROD_API_KEY }}" >> $GITHUB_ENV
```

Locally, you'd export the same variables in your shell before running `npm run test:prod`, or use a local `.env` (untracked) loaded by your shell profile.

---

## 7. CI matrix

`.github/workflows/playwright.yml` runs `dev` + `stag` automatically on every push/PR, and lets you manually trigger any single environment (including `prod`) via `workflow_dispatch`. Each environment gets its own HTML report and trace artifacts uploaded, retained 14 days.

---

## 8. Extending this framework

- **New environment** (e.g. `qa`): add `env/qa.env`, add `'qa'` to `VALID_ENVS` in `config/env.config.ts`, add a `test:qa` npm script.
- **New API resource**: add a class in `src/api/endpoints/`, expose it via a fixture in `src/fixtures/api.fixture.ts`.
- **New UI page**: add a class in `src/ui/pages/` extending `BasePage`, expose it via `src/fixtures/ui.fixture.ts`.
- **Role-based auth** (admin vs standard user): duplicate `auth.setup.ts` → `admin-auth.setup.ts`, save to `auth/<env>-admin.json`, add an `ui-chromium-admin` project pointing at that storageState file.
- **Mobile viewports**: add projects using `devices['Pixel 7']` / `devices['iPhone 14']` from `@playwright/test`.

---

## 9. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `❌ ENV variable not set` | Ran `playwright test` directly without `ENV=` | Use the npm scripts, or prefix manually: `ENV=dev npx playwright test` |
| `❌ Env file not found` | Typo'd env name or file missing | Check `env/<ENV>.env` exists |
| `❌ Missing required variable(s)` | `.env` file incomplete | Compare against `env/.env.example` |
| `❌ Placeholder ${X} could not be resolved` | Running `prod` without the secret exported | Export `X` in your shell or CI secrets before running |
| UI tests fail at first action, "storageState file not found" | `setup` project didn't run | Don't filter projects in a way that excludes `setup` when running authenticated UI projects |
