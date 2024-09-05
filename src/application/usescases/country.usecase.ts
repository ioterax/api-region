import { ICountry } from "@atisiothings/laniakea-lib-central/dist/domain/region";
import { CrudUseCase } from "./core/crud.usecase";
import { ViewUseCase } from "./core/view.usecase";

export interface CountryCrudUseCase extends CrudUseCase<ICountry, String> {}
export const CountryCrudUseCase = Symbol('CountryCrudUseCase');

export interface CountryViewUseCase extends ViewUseCase<ICountry, String> {}
export const CountryViewUseCase = Symbol('CountryViewUseCase');
