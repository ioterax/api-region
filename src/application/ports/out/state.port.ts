/* eslint-disable @typescript-eslint/no-empty-object-type */
import { IState } from '@ioterax/laniakea-lib-central';
import { CrudOutPort } from '@ioterax/laniakea-lib-database';

export interface StateOutPort extends CrudOutPort<IState, string> {}
export const StateOutPort = Symbol('StateOutPort');
