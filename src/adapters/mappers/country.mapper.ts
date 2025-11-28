import { MapperFor, GenericMapper } from '@ioterax/laniakea-lib-mapper';
import { Country } from '@/framework/controller/models/country.model';
import { ICountry } from '@ioterax/laniakea-lib-central';

@MapperFor(Country)
export class CountryMapper extends GenericMapper<ICountry, Country> {
  constructor() {
    super(Country, {
      beforeTransform: (entity) => ({
        ...entity,
      }),

      presets: {
        list: ['code', 'name'],
      },
    });
  }
}
