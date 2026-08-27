import { readFileSync } from 'node:fs';

export interface RegionApiConfiguration {
  readonly serviceName: string;
  readonly mongoUri: string;
  readonly databaseName: 'foundation_central';
  readonly port: number;
}

export const REGION_API_CONFIGURATION = Symbol('RegionApiConfiguration');

function configurationError(name: string, detail: string): Error {
  return new Error(`${name} ${detail}`);
}

function secretValue(name: string, fileName: string): string {
  const direct = process.env[name]?.trim();
  const file = process.env[fileName]?.trim();
  if (direct && file) throw configurationError(`${name}, ${fileName}`, 'must use one source');
  if (direct) return direct;
  if (!file) throw configurationError(name, 'is required');
  try {
    const value = readFileSync(file, 'utf8').trim();
    if (value) return value;
  } catch {
    throw configurationError(fileName, 'cannot be read');
  }
  throw configurationError(fileName, 'is empty');
}

function port(): number {
  const raw = process.env.PORT?.trim() || process.env.LISTEN_PORT?.trim() || '3903';
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1024 || value > 65_535) {
    throw configurationError('PORT', 'must be an integer from 1024 through 65535');
  }
  return value;
}

/** Reads the complete fail-closed API configuration without exposing credentials. */
export function loadRegionApiConfiguration(): RegionApiConfiguration {
  const mongoUri = secretValue('MONGODB_URI', 'MONGODB_URI_FILE');
  try {
    const protocol = new URL(mongoUri).protocol;
    if (protocol !== 'mongodb:' && protocol !== 'mongodb+srv:') throw new Error('protocol');
  } catch {
    throw configurationError('MONGODB_URI', 'must use mongodb or mongodb+srv');
  }
  const databaseName = process.env.MONGODB_DATABASE?.trim() || 'foundation_central';
  if (databaseName !== 'foundation_central') {
    throw configurationError('MONGODB_DATABASE', 'must be foundation_central');
  }
  return {
    serviceName: process.env.SERVICE_NAME?.trim() || 'api-region',
    mongoUri,
    databaseName,
    port: port(),
  };
}
