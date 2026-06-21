import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { envConfig } from './config/env.config';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? envConfig.retryCount : 0,
  workers: process.env.CI ? 4 : undefined,

  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ...(process.env.CI ? [['github'] as const] : []),
  ],

  globalSetup: require.resolve('./global-setup.ts'),

  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: envConfig.defaultTimeout,
  },

  projects: [
    // ============ API PROJECT ============
    // No browser. Pure HTTP. Runs fastest, fully parallel with UI.
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: envConfig.apiBaseURL,
      },
    },

    // ============ UI AUTH SETUP ============
    // Logs in once via the real UI, saves storageState, every UI project depends on it.
    {
      name: 'setup',
      testDir: './tests/ui',
      testMatch: /.*\.setup\.ts/,
      use: {
        baseURL: envConfig.baseURL,
      },
    },

    // ============ UI PROJECTS (authenticated) ============
    // testIgnore excludes both the setup file AND the unauth-only spec, so a
    // logged-out-by-design test never accidentally runs with an injected session.
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      testIgnore: [/.*\.setup\.ts/, /.*\.unauth\.spec\.ts/],
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: envConfig.baseURL,
        storageState: path.resolve(__dirname, `auth/${envConfig.env}.json`),
      },
    },
    {
      name: 'ui-firefox',
      testDir: './tests/ui',
      testIgnore: [/.*\.setup\.ts/, /.*\.unauth\.spec\.ts/],
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Firefox'],
        baseURL: envConfig.baseURL,
        storageState: path.resolve(__dirname, `auth/${envConfig.env}.json`),
      },
    },
    {
      name: 'ui-webkit',
      testDir: './tests/ui',
      testIgnore: [/.*\.setup\.ts/, /.*\.unauth\.spec\.ts/],
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Safari'],
        baseURL: envConfig.baseURL,
        storageState: path.resolve(__dirname, `auth/${envConfig.env}.json`),
      },
    },

    // ============ UI PROJECT (no auth, e.g. testing the login page itself) ============
    {
      name: 'ui-unauthenticated',
      testDir: './tests/ui',
      testIgnore: /.*\.setup\.ts/,
      testMatch: /.*\.unauth\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: envConfig.baseURL,
        // no storageState — fresh, logged-out browser context
      },
    },
  ],
});
