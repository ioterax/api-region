import { State } from "@/framework/repository/mongodb/schemas/state.schema";
import { CrudUseCase } from "./core/crud.usecase";

export interface StateUseCase extends CrudUseCase<State, String> {}

export const StateUseCase = Symbol('StateUseCase');
