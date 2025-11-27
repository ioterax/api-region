/* eslint-disable @typescript-eslint/no-empty-object-type */
import { ICountry } from '@ioterax/laniakea-lib-central';
import { CrudUseCase, ViewUseCase } from '@ioterax/laniakea-lib-core';

export interface CountryCrudUseCase extends CrudUseCase<ICountry, string> {}
export const CountryCrudUseCase = Symbol('CountryCrudUseCase');

export interface CountryViewUseCase extends ViewUseCase<ICountry, string> {}
export const CountryViewUseCase = Symbol('CountryViewUseCase');
