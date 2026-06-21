import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

export type EnvName = 'dev' | 'stag' | 'prod';

export interface EnvConfig {
  env: EnvName;
  baseURL: string;
  apiBaseURL: string;
  userEmail: string;
  userPassword: string;
  apiKey: string;
  apiUserEmail: string;
  apiUserPassword: string;
  defaultTimeout: number;
  retryCount: number;
}

const VALID_ENVS: EnvName[] = ['dev', 'stag', 'prod'];

/**
 * Resolves ${VAR_NAME} placeholders inside a value against process.env.
 * This lets prod.env contain USER_PASSWORD=${PROD_USER_PASSWORD} while the
 * actual secret is injected by CI (GitHub Actions secrets, Vault, etc.)
 * and never committed to the repo.
 */
function resolvePlaceholders(value: string): string {
  return value.replace(/\$\{([^}]+)\}/g, (_match, varName: string) => {
    const resolved = process.env[varName];
    if (!resolved) {
      throw new Error(
        `❌ Placeholder \${${varName}} could not be resolved. ` +
          `Set it as a real environment variable / CI secret before running tests.`
      );
    }
    return resolved;
  });
}

function validateEnvName(raw: string | undefined): EnvName {
  if (!raw) {
    throw new Error(
      `❌ ENV variable not set. Run tests like: cross-env ENV=dev playwright test ` +
        `(valid values: ${VALID_ENVS.join(', ')})`
    );
  }
  if (!VALID_ENVS.includes(raw as EnvName)) {
    throw new Error(`❌ Invalid ENV "${raw}". Valid values are: ${VALID_ENVS.join(', ')}`);
  }
  return raw as EnvName;
}

function loadEnv(): EnvConfig {
  const envName = validateEnvName(process.env.ENV);
  const envFilePath = path.resolve(__dirname, `../env/${envName}.env`);

  if (!fs.existsSync(envFilePath)) {
    throw new Error(
      `❌ Env file not found at ${envFilePath}.\n` +
        `   Create it (see env/.env.example) or check your ENV value.`
    );
  }

  const parsed = dotenv.parse(fs.readFileSync(envFilePath));

  // Resolve ${PLACEHOLDER} style values (used in prod.env) against real env vars / CI secrets
  const resolved: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed)) {
    resolved[key] = resolvePlaceholders(value);
  }

  // Merge into process.env so other tools (e.g. dotenv-reliant libs) can also see them
  Object.assign(process.env, resolved);

  const required = [
    'BASE_URL',
    'API_BASE_URL',
    'USER_EMAIL',
    'USER_PASSWORD',
    'API_KEY',
    'API_USER_EMAIL',
    'API_USER_PASSWORD',
  ];
  const missing = required.filter((k) => !resolved[k]);
  if (missing.length) {
    throw new Error(`❌ Missing required variable(s) in env/${envName}.env: ${missing.join(', ')}`);
  }

  return {
    env: envName,
    baseURL: resolved.BASE_URL,
    apiBaseURL: resolved.API_BASE_URL,
    userEmail: resolved.USER_EMAIL,
    userPassword: resolved.USER_PASSWORD,
    apiKey: resolved.API_KEY,
    apiUserEmail: resolved.API_USER_EMAIL,
    apiUserPassword: resolved.API_USER_PASSWORD,
    defaultTimeout: Number(resolved.DEFAULT_TIMEOUT ?? 30000),
    retryCount: Number(resolved.RETRY_COUNT ?? 0),
  };
}

// Loaded & validated once, reused everywhere (config, fixtures, global-setup, tests)
export const envConfig: EnvConfig = loadEnv();
