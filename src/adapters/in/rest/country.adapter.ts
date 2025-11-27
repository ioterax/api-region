import { Inject, Injectable } from '@nestjs/common';
import { AppLogger } from '@ioterax/laniakea-lib-audit';
import { ICountry } from '@ioterax/laniakea-lib-central';
import { CountryInPort } from '@/application/ports/in/country.port';
import {
  CountryCrudUseCase,
  CountryViewUseCase,
} from '@/application/usescases/country.usecase';

@Injectable()
export class CountryRestInAdapter implements CountryInPort<Partial<ICountry>> {
  constructor(
    @Inject(AppLogger) private readonly logger: AppLogger,
    @Inject(CountryCrudUseCase)
    private readonly crudUseCase: CountryCrudUseCase,
    @Inject(CountryViewUseCase)
    private readonly viewUseCase: CountryViewUseCase,
  ) {}

  // -------------------------------------------------------------
  // CREATE
  // -------------------------------------------------------------
  handleToRegister(country: ICountry): Promise<ICountry> {
    // return this.crudUseCase.registerNew(country);
    throw new Error('Method not implemented.');
  }

  // -------------------------------------------------------------
  // READ ALL
  // -------------------------------------------------------------
  handleFindAll(): Promise<ICountry[]> {
    return this.crudUseCase.retrieveAll();
  }

  // -------------------------------------------------------------
  // READ ONE (from base CRUD adapter)
  // -------------------------------------------------------------
  handleFindOne(id: string): Promise<Partial<ICountry> | null> {
    // return this.crudUseCase.retrieveOne(id);
    throw new Error('Method not implemented.');
  }

  // -------------------------------------------------------------
  // UPDATE
  // -------------------------------------------------------------
  handleUpdateOne(
    id: string,
    domain: Partial<ICountry>,
  ): Promise<Partial<ICountry> | null> {
    // return this.crudUseCase.updateOne(id, domain);
    throw new Error('Method not implemented.');
  }

  // -------------------------------------------------------------
  // DELETE
  // -------------------------------------------------------------
  handleRemoveOne(id: string): Promise<void> {
    // return this.crudUseCase.removeOne(id);
    throw new Error('Method not implemented.');
  }

  // -------------------------------------------------------------
  // VIEW: SIMPLE READ ALL
  // -------------------------------------------------------------
  handleSimpleViewFindAll(): Promise<ICountry[]> {
    // return this.viewUseCase.retrieveAll(MAPPER_ID_NAME);
    throw new Error('Method not implemented.');
  }

  // -------------------------------------------------------------
  // VIEW: SIMPLE READ ONE
  // -------------------------------------------------------------
  handleSimpleViewFindOne(id: string): Promise<ICountry | null> {
    // return this.viewUseCase.retrieveOne(id, MAPPER_ID_NAME);
    throw new Error('Method not implemented.');
  }
}
