import { State } from "@/framework/repository/schemas/state.schema";
import { CrudUseCase } from "./crud.usecase";

export interface StateUseCase extends CrudUseCase<State, String> {}

export const StateUseCase = Symbol('StateUseCase');
