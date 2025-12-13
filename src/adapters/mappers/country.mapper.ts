import { MapperFor, GenericMapper } from '@ioterax/infra-lib-mapper';
import { ICountry } from '@ioterax/foundation-lib-central';
import { Country } from '@/framework/controller/models/country.model';

@MapperFor(Country)
export class CountryMapper extends GenericMapper<ICountry, Country> {
  constructor() {
    super(Country, {
      beforeTransform: entity => ({
        ...entity,
      }),

      presets: {
        list: ['code', 'name'],
      },
    });
  }
}
