import { CountryOutPort } from "@/application/ports/out/country.out.port";
import { CountryMongoDbRepository } from "./mongodb/country.repository";
import { Country, CountrySchema } from "./mongodb/schemas/country.schema";
import { State, StateSchema } from "./mongodb/schemas/state.schema";
import { StateOutPort } from "@/application/ports/out/state.out.port";
import { StateMongoRepository } from "./mongodb/state.repository";
import { DatabaseConfigOptions } from "@atisiothings/laniakea-lib-database/dist/module/context.module";

export const countryConfig: DatabaseConfigOptions = {  
  connectName: process.env.MONGO_REGION_CN_NAME as string,
  dbName: 'region',
  dbType: process.env.DATABASE_TYPE as string,
  models: [
    { name: Country.name, schema: CountrySchema },
  ],
  outPortProviders: [
    { provide: CountryOutPort, useClass: CountryMongoDbRepository },
  ]
}

export const stateConfig: DatabaseConfigOptions = {
  connectName: process.env.MONGO_REGION_CN_NAME as string,
  dbName: 'region',
  dbType: process.env.DATABASE_TYPE as string,
  models: [
    { name: State.name, schema: StateSchema }
  ],
  outPortProviders: [
    { provide: StateOutPort, useClass: StateMongoRepository },
  ]
}
