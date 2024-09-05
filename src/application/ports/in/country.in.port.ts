import { ICountry } from "@atisiothings/laniakea-lib-central/dist/domain/region";
import { CrudInPort } from "./crud.in.port";

export interface CountryInPort extends CrudInPort<ICountry, String> {

    handleSimpleViewFindAll(): Promise<ICountry[]>

    handleSimpleViewFindOne(id: String): Promise<ICountry | null>

}

export const CountryInPort = Symbol('CountryInPort');
