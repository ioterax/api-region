/* eslint-disable @typescript-eslint/no-empty-object-type */
import { CrudUseCase, ViewUseCase } from '@ioterax/foundation-lib-core';
import { ICountry } from '@ioterax/foundation-lib-central';

export interface CountryCrudUseCase extends CrudUseCase<ICountry, string> {}
export const CountryCrudUseCase = Symbol('CountryCrudUseCase');

export interface CountryViewUseCase extends ViewUseCase<ICountry, string> {}
export const CountryViewUseCase = Symbol('CountryViewUseCase');
