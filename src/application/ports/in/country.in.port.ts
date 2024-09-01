import { Country } from "@/framework/repository/schemas/country.schema";
import { CrudInPort } from "./crud.in.port";

export interface CountryInPort extends CrudInPort<Country, String> {}

export const CountryInPort = Symbol('CountryInPort');
