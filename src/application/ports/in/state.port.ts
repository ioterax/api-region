/* eslint-disable @typescript-eslint/no-empty-object-type */
import { IState } from '@ioterax/laniakea-lib-central';
import { AdapterHandleCrudInPort } from '@ioterax/laniakea-lib-sec-comm';

export interface StateInPort
  extends AdapterHandleCrudInPort<Partial<IState>, string> {}
export const StateInPort = Symbol('StateInPort');
