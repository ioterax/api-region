import { ICountry } from '@ioterax/laniakea-lib-central';
import { AdapterHandleCrudInPort } from '@ioterax/laniakea-lib-sec-comm';

export interface CountryInPort<V extends Partial<ICountry>>
  extends AdapterHandleCrudInPort<V, string> {
  handleSimpleViewFindAll(): Promise<ICountry[]>;
  handleSimpleViewFindOne(id: string): Promise<ICountry | null>;
}

export const CountryInPort = Symbol('CountryInPort');
