/* eslint-disable @typescript-eslint/no-empty-object-type */
import { AdapterHandleCrudInPort } from '@ioterax/infra-lib-connectivity';
import { IState } from '@ioterax/foundation-lib-central';

export interface StateInPort extends AdapterHandleCrudInPort<Partial<IState>, string> {}
export const StateInPort = Symbol('StateInPort');
