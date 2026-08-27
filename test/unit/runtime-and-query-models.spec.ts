import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AdministrativeDivisionType, GeographicPlaceType } from '@ioterax/foundation-lib-central';
import { loadRegionApiConfiguration } from '@/infra/runtime.config';
import {
  AdministrativeDivisionListQueryModel,
  CountryListQueryModel,
  GeographicPlaceListQueryModel,
  RegionIdParamModel,
  RegionSearchQueryModel,
} from '@/adapters/in/rest/models/region-query.model';

const ORIGINAL_ENV = { ...process.env };

describe('Region API runtime configuration', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV, MONGODB_URI: 'mongodb://localhost:27017' };
    delete process.env.MONGODB_URI_FILE;
    delete process.env.MONGODB_DATABASE;
    delete process.env.PORT;
    delete process.env.LISTEN_PORT;
    delete process.env.SERVICE_NAME;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('loads exact defaults and approved overrides', () => {
    expect(loadRegionApiConfiguration()).toEqual({
      serviceName: 'api-region',
      mongoUri: 'mongodb://localhost:27017',
      databaseName: 'foundation_central',
      port: 3903,
    });
    process.env.MONGODB_URI = 'mongodb+srv://example.invalid';
    process.env.SERVICE_NAME = 'custom-region';
    process.env.PORT = '4903';
    expect(loadRegionApiConfiguration()).toMatchObject({
      serviceName: 'custom-region',
      port: 4903,
    });
    delete process.env.PORT;
    process.env.LISTEN_PORT = '4904';
    expect(loadRegionApiConfiguration().port).toBe(4904);
  });

  it('reads a non-empty credential file', () => {
    const directory = mkdtempSync(join(tmpdir(), 'api-region-config-'));
    const credential = join(directory, 'mongodb-uri');
    writeFileSync(credential, 'mongodb://localhost:27017\n');
    delete process.env.MONGODB_URI;
    process.env.MONGODB_URI_FILE = credential;
    expect(loadRegionApiConfiguration().mongoUri).toBe('mongodb://localhost:27017');
    rmSync(directory, { recursive: true });
  });

  it.each([
    [{ MONGODB_URI_FILE: '/tmp/another-secret' }, 'must use one source'],
    [{ MONGODB_URI: undefined }, 'is required'],
    [{ MONGODB_URI: 'https://example.com' }, 'must use mongodb or mongodb+srv'],
    [{ MONGODB_DATABASE: 'wrong_database' }, 'must be foundation_central'],
    [{ PORT: '80' }, 'must be an integer'],
    [{ PORT: 'not-a-port' }, 'must be an integer'],
  ])('rejects invalid environment %p', (overrides, expected) => {
    Object.assign(process.env, overrides);
    expect(() => loadRegionApiConfiguration()).toThrow(expected);
  });

  it('rejects unreadable and empty credential files', () => {
    delete process.env.MONGODB_URI;
    process.env.MONGODB_URI_FILE = '/tmp/api-region-missing-secret';
    expect(() => loadRegionApiConfiguration()).toThrow('cannot be read');
    const directory = mkdtempSync(join(tmpdir(), 'api-region-empty-config-'));
    const credential = join(directory, 'mongodb-uri');
    writeFileSync(credential, '  ');
    process.env.MONGODB_URI_FILE = credential;
    expect(() => loadRegionApiConfiguration()).toThrow('is empty');
    rmSync(directory, { recursive: true });
  });
});

describe('Region REST query validation', () => {
  it('normalizes country pagination and ISO filters', () => {
    const model = plainToInstance(CountryListQueryModel, {
      page: '2',
      pageSize: '50',
      isoAlpha2: ' es ',
      languageTag: 'es-ES',
    });
    expect(validateSync(model)).toHaveLength(0);
    expect(model).toMatchObject({ page: 2, pageSize: 50, isoAlpha2: 'ES' });
    expect(validateSync(plainToInstance(CountryListQueryModel, {}))).toHaveLength(0);
  });

  it('validates division and place filters against shared enums', () => {
    const division = plainToInstance(AdministrativeDivisionListQueryModel, {
      countryCode: 'es',
      level: '1',
      type: AdministrativeDivisionType.AUTONOMOUS_COMMUNITY,
      parentId: 'ES',
    });
    const place = plainToInstance(GeographicPlaceListQueryModel, {
      countryCode: 'es',
      type: GeographicPlaceType.CITY,
      parentDivisionId: 'ES-CT',
    });
    expect(validateSync(division)).toHaveLength(0);
    expect(validateSync(place)).toHaveLength(0);
  });

  it('normalizes bounded search kinds and rejects malformed input', () => {
    const search = plainToInstance(RegionSearchQueryModel, {
      query: ' Barcelona ',
      kinds: 'country,place',
      countryCode: 'es',
    });
    expect(validateSync(search)).toHaveLength(0);
    expect(search).toMatchObject({
      query: 'Barcelona',
      kinds: ['country', 'place'],
      countryCode: 'ES',
    });
    const defaults = plainToInstance(RegionSearchQueryModel, { query: 'Madrid' });
    expect(validateSync(defaults)).toHaveLength(0);
    expect(defaults.kinds).toHaveLength(3);
    const invalid = plainToInstance(RegionSearchQueryModel, {
      query: {},
      kinds: {},
      page: '-1',
      pageSize: '101',
    });
    expect(validateSync(invalid).length).toBeGreaterThan(0);
  });

  it('accepts only worker-compatible stable IDs', () => {
    expect(validateSync(plainToInstance(RegionIdParamModel, { id: 'ES:BCN_1.2' }))).toHaveLength(0);
    expect(
      validateSync(plainToInstance(RegionIdParamModel, { id: '../secret' })).length,
    ).toBeGreaterThan(0);
  });
});
