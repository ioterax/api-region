import { Inject, Injectable } from '@nestjs/common';

import { CountryUseCase } from '@/application/usescases/country.usecase';
import { CountryOutPort } from '@/application/ports/out/country.out.port';
import { Country } from '@/framework/repository/schemas/country.schema';

@Injectable()
export class CountryService implements CountryUseCase {

  constructor(@Inject(CountryOutPort) private readonly countryOutPort: CountryOutPort) {}

  registerNew(country: Country): Promise<Country> {
    // add validation
    return this.countryOutPort.save(country);
  }

  retrieveAll(): Promise<Country[]> {
    return this.countryOutPort.findAll();
  }
  
  retrieveOne(id: string): Promise<Country | null> {
      return this.countryOutPort.findById(id);
  }

  updateOne(id: string, country: Country): Promise<Country | null> {
    return this.countryOutPort.updateById(id, country);
  }

  removeOne(id: string) {
    this.countryOutPort.deleteById(id);
  }
}


// https://github.com/ThomasOliver545/Blog-with-NestJS-and-Angular/blob/master/api/src/blog/service/blog.service.ts
// 1. https://docs.nestjs.com/guards
// 2. https://docs.nestjs.com/security/authentication
// 3. https://docs.nestjs.com/security/authorization