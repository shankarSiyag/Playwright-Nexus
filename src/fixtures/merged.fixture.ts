import { mergeTests } from '@playwright/test';
import { test as apiTest } from './api.fixture';
import { test as uiTest } from './ui.fixture';

// Use this in tests that need BOTH API setup (e.g. seeding data, getting a token)
// AND UI page objects (e.g. verifying that data appears in the browser).
export const test = mergeTests(apiTest, uiTest);
export const expect = test.expect;
