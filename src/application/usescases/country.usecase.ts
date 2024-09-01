import { Country } from "@/framework/repository/schemas/country.schema";

export interface CountryUseCase {

  registerNew(country: Country): Promise<Country>;

  retrieveAll(): Promise<Country[]>;

  retrieveOne(id: string): Promise<Country | null>;

  updateOne(id: string, country: Country): Promise<Country | null>;
  
  removeOne(id: string);

}

export const CountryUseCase = Symbol('CountryUseCase');
