import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { envConfig } from './config/env.config';
import { logger } from './src/utils/logger';

async function globalSetup(_config: FullConfig): Promise<void> {
  logger.info(`\n🚀 Starting test run`, {
    env: envConfig.env,
    baseURL: envConfig.baseURL,
    apiBaseURL: envConfig.apiBaseURL,
  });

  // Ensure the auth/ directory exists so storageState writes don't fail on a fresh checkout
  const authDir = path.resolve(__dirname, 'auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }
}

export default globalSetup;
