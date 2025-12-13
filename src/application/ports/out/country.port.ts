/* eslint-disable @typescript-eslint/no-empty-object-type */
import { CrudOutPort } from '@ioterax/infra-lib-database';
import { ICountry } from '@ioterax/foundation-lib-central';

export interface CountryOutPort extends CrudOutPort<ICountry, string> {}
export const CountryOutPort = Symbol('CountryOutPort');
