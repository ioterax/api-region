/* eslint-disable @typescript-eslint/no-empty-object-type */
import { IState } from '@ioterax/laniakea-lib-central';
import { CrudUseCase } from '@ioterax/laniakea-lib-core';

export interface StateUseCase extends CrudUseCase<IState, string> {}
export const StateUseCase = Symbol('StateUseCase');
