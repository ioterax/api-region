
import { State } from "@/framework/repository/schemas/state.schema";
import { CrudInPort } from "./crud.in.port";

export interface StateInPort extends CrudInPort<State, String> {}

export const StateInPort = Symbol('StateInPort');
