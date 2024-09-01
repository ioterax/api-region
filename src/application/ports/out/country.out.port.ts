import { Country } from "@/framework/repository/schemas/country.schema";

export interface CountryOutPort {

    save(country: Country): Promise<Country>

    findAll(): Promise<Country[]>

    findById(id: string): Promise<Country | null>

    updateById(id: string, country: Country): Promise<Country | null>

    deleteById(id: string)

}

export const CountryOutPort = Symbol('CountryOutPort');
