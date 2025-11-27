/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Inject, Injectable } from '@nestjs/common';

import { ICountry } from '@ioterax/laniakea-lib-central/dist/domain/region';
import {
  CountryCrudUseCase,
  CountryViewUseCase,
} from '@/application/usescases/country.usecase';
import { CountryOutPort } from '@/application/ports/out/country.port';

@Injectable()
export class CountryService implements CountryCrudUseCase {
  constructor(
    @Inject(CountryOutPort) private readonly countryOutPort: CountryOutPort,
  ) {}

  async registerNew(domain: ICountry): Promise<ICountry> {
    // add validation
    return await this.countryOutPort.save(domain);
  }

  async retrieveAll(): Promise<ICountry[]> {
    return await this.countryOutPort.findAll();
  }

  async retrieveOne(id: string): Promise<ICountry | null> {
    return await this.countryOutPort.findById(id);
  }

  async updateOne(id: string, domain: ICountry): Promise<ICountry | null> {
    return await this.countryOutPort.updateById(id, domain);
  }

  async removeOne(id: string): Promise<void> {
    await this.countryOutPort.deleteById(id);
  }
}

@Injectable()
export class CountryViewService implements CountryViewUseCase {
  constructor(
    @Inject(CountryOutPort) private readonly countryOutPort: CountryOutPort,
  ) {}

  async retrieveAll(project: {} | ICountry): Promise<ICountry[]> {
    return await this.countryOutPort.findAll(project);
  }

  async retrieveOne(
    id: string,
    project: ICountry | {},
  ): Promise<ICountry | null> {
    console.log(project);
    return await this.countryOutPort.findById(id, project);
  }
}
