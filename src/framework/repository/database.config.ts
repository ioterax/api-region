import { CountryOutPort } from '@/application/ports/out/country.port';
import { DatabaseConfigOptions } from '@ioterax/infra-lib-database';
import { StateOutPort } from '@/application/ports/out/state.port';
import { CountryMongoDbRepository } from './mongodb/country.repository';
import { Country, CountrySchema } from './mongodb/schemas/country.schema';
import { State, StateSchema } from './mongodb/schemas/state.schema';
import { StateMongoRepository } from './mongodb/state.repository';

export const regionConfig: DatabaseConfigOptions = {
  connectName: process.env.MONGO_REGION_CN_NAME as string,
  dbType: 'mongodb',
  models: [
    { name: Country.name, schema: CountrySchema },
    { name: State.name, schema: StateSchema },
  ],
  outPortProviders: [
    { provide: CountryOutPort, useClass: CountryMongoDbRepository },
    { provide: StateOutPort, useClass: StateMongoRepository },
  ],
};
