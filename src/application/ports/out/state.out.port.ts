import { State } from "@atisiothings/laniakea-lib-central/dist/domain/region";
import { CrudOutPort } from "./core/crud.out.port";

export interface StateOutPort extends CrudOutPort<State, String> {}

export const StateOutPort = Symbol('StateOutPort');
