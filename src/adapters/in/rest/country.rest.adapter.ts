import { CountryInPort } from "@/application/ports/in/country.in.port";
import { CountryUseCase } from "@/application/usescases/country.usecase";
import { Country } from "@/framework/repository/schemas/country.schema";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class CountryRestAdapter implements CountryInPort {

    constructor(
        @Inject(CountryUseCase) private readonly countryUseCase: CountryUseCase
    ) {}

    handleToRegister(country: Country): Promise<Country> {
        return this.countryUseCase.registerNew(country)
    }

    handleFindAll(): Promise<Country[]> {
      return this.countryUseCase.retrieveAll();
    }

    handleFindOne(id: string): Promise<Country | null> {
      return this.countryUseCase.retrieveOne(id);
    }
  
    handleUpdateOne(id: string, country: Country) {
      return this.countryUseCase.updateOne(id, country);
    }
  
    handleRemoveOne(id: string) {
      console.log(`id: ${id}`)
        this.countryUseCase.removeOne(id);
    }

}
