/* eslint-disable @typescript-eslint/no-empty-object-type */
import { CrudUseCase } from '@ioterax/foundation-lib-core';
import { IState } from '@ioterax/foundation-lib-central';

export interface StateUseCase extends CrudUseCase<IState, string> {}
export const StateUseCase = Symbol('StateUseCase');
