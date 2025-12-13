import { AdapterHandleCrudInPort } from '@ioterax/infra-lib-connectivity';
import { ICountry } from '@ioterax/foundation-lib-central';

export interface CountryInPort<V extends Partial<ICountry>> extends AdapterHandleCrudInPort<V, string> {
  handleSimpleViewFindAll(): Promise<ICountry[]>;
  handleSimpleViewFindOne(id: string): Promise<ICountry | null>;
}

export const CountryInPort = Symbol('CountryInPort');
