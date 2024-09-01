import { Country } from "@/framework/repository/schemas/country.schema";
import { CrudOutPort } from "./crud.out.port";

export interface CountryOutPort extends CrudOutPort<Country, String> {}

export const CountryOutPort = Symbol('CountryOutPort');
