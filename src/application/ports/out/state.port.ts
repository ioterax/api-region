/* eslint-disable @typescript-eslint/no-empty-object-type */
import { CrudOutPort } from '@ioterax/infra-lib-database';
import { IState } from '@ioterax/foundation-lib-central';

export interface StateOutPort extends CrudOutPort<IState, string> {}
export const StateOutPort = Symbol('StateOutPort');
