/* eslint-disable @typescript-eslint/no-empty-object-type */
import { ICountry } from '@ioterax/laniakea-lib-central/dist/domain/region';
import { CrudOutPort } from '@ioterax/laniakea-lib-database';

export interface CountryOutPort extends CrudOutPort<ICountry, string> {}
export const CountryOutPort = Symbol('CountryOutPort');
