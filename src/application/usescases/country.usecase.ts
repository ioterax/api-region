import { Country } from "@/framework/repository/schemas/country.schema";
import { CrudUseCase } from "./crud.usecase";

export interface CountryUseCase extends CrudUseCase<Country, String> {}

export const CountryUseCase = Symbol('CountryUseCase');
