import { CountryOutPort } from '@/application/ports/out/country.port';
import { SiloCtxEnum } from '@ioterax/laniakea-lib-bootstrap';
import { DatabaseConfigOptions } from '@ioterax/laniakea-lib-database';
import { StateOutPort } from '@/application/ports/out/state.port';
import { CountryMongoDbRepository } from './mongodb/country.repository';
import { Country, CountrySchema } from './mongodb/schemas/country.schema';
import { State, StateSchema } from './mongodb/schemas/state.schema';
import { StateMongoRepository } from './mongodb/state.repository';

export const countryConfig: DatabaseConfigOptions = {
  connectName: process.env.MONGO_REGION_CN_NAME as string,
  dbName: `${SiloCtxEnum.FOUNDATION}_generic`.toLowerCase(),
  dbType: process.env.DATABASE_TYPE as string,
  models: [{ name: Country.name, schema: CountrySchema }],
  outPortProviders: [
    { provide: CountryOutPort, useClass: CountryMongoDbRepository },
  ],
};

export const stateConfig: DatabaseConfigOptions = {
  connectName: process.env.MONGO_REGION_CN_NAME as string,
  dbName: `${SiloCtxEnum.FOUNDATION}_generic`.toLowerCase(),
  dbType: process.env.DATABASE_TYPE as string,
  models: [{ name: State.name, schema: StateSchema }],
  outPortProviders: [{ provide: StateOutPort, useClass: StateMongoRepository }],
};
