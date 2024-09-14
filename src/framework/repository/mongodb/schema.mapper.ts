import { CountryOutPort } from "@/application/ports/out/country.out.port";
import { CountryMongoDbRepository } from "./country.repository";
import { Country, CountrySchema } from "./schemas/country.schema";
import { State, StateSchema } from "./schemas/state.schema";
import { StateOutPort } from "@/application/ports/out/state.out.port";
import { StateMongoRepository } from "./state.repository";
import { DatabaseConfigOptions } from "@/modules/context.module";

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
