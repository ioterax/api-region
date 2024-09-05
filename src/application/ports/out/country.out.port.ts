import { ICountry } from "@atisiothings/laniakea-lib-central/dist/domain/region";
import { CrudOutPort } from "./core/crud.out.port";

export interface CountryOutPort extends CrudOutPort<ICountry, String> {}
export const CountryOutPort = Symbol('CountryOutPort');
