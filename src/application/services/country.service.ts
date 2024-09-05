import { Inject, Injectable } from '@nestjs/common';

import { ICountry } from '@atisiothings/laniakea-lib-central/dist/domain/region';
import { CountryCrudUseCase, CountryViewUseCase } from '@/application/usescases/country.usecase';
import { CountryOutPort } from '@/application/ports/out/country.out.port';

@Injectable()
export class CountryService implements CountryCrudUseCase {

  constructor(@Inject(CountryOutPort) private readonly countryOutPort: CountryOutPort) {}

  registerNew(country: ICountry): Promise<ICountry> {
    // add validation
    return this.countryOutPort.save(country);
  }

  retrieveAll(): Promise<ICountry[]> {
    return this.countryOutPort.findAll();
  }

  retrieveOne(id: String): Promise<ICountry | null> {
      return this.countryOutPort.findById(id);
  }

  updateOne(id: String, country: ICountry): Promise<ICountry | null> {
    return this.countryOutPort.updateById(id, country);
  }

  removeOne(id: String) {
    this.countryOutPort.deleteById(id);
  }
}

@Injectable()
export class CountryViewService implements CountryViewUseCase {

  constructor(@Inject(CountryOutPort) private readonly countryOutPort: CountryOutPort) {}

  retrieveAll(project: {} | ICountry): Promise<ICountry[]> {
    return this.countryOutPort.findAll(project);
  }

  retrieveOne(id: String, project: ICountry | {}): Promise<ICountry | null> {
    console.log(project);
    return this.countryOutPort.findById(id, project);
  }

}
