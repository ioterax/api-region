import { Country } from "@/framework/repository/schemas/country.schema";

export interface CountryInPort {

    handleToRegister(country: Country): Promise<Country>

    handleFindAll(): Promise<Country[]> 

    handleFindOne(id: string): Promise<Country | null> 

    handleUpdateOne(id: string, country: Country)

    handleRemoveOne(id: string)

}

export const CountryInPort = Symbol('CountryInPort');
