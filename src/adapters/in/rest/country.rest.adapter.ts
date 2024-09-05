import { Inject, Injectable } from "@nestjs/common";

import { ICountry } from "@atisiothings/laniakea-lib-central/dist/domain/region";
import { CountryInPort } from "@/application/ports/in/country.in.port";
import { CountryCrudUseCase, CountryViewUseCase } from "@/application/usescases/country.usecase";

import { MAPPER_ID_NAME } from "../mapper/mapper";

@Injectable()
export class CountryRestAdapter implements CountryInPort {

    constructor(
        @Inject(CountryCrudUseCase) private readonly crudUseCase: CountryCrudUseCase,
        @Inject(CountryViewUseCase) private readonly viewUseCase: CountryViewUseCase
    ) {}

    handleToRegister(country: ICountry): Promise<ICountry> {
        return this.crudUseCase.registerNew(country)
    }

    handleFindAll(): Promise<ICountry[]> {
      return this.crudUseCase.retrieveAll();
    }

    handleFindOne(id: String): Promise<ICountry | null> {
      return this.crudUseCase.retrieveOne(id);
    }
  
    handleUpdateOne(id: String, country: ICountry) {
      return this.crudUseCase.updateOne(id, country);
    }
  
    handleRemoveOne(id: String) {
      this.crudUseCase.removeOne(id);
    }

    handleSimpleViewFindAll(): Promise<ICountry[]> {
      return this.viewUseCase.retrieveAll(MAPPER_ID_NAME);
    }

    
    handleSimpleViewFindOne(id: String): Promise<ICountry | null> {
      return this.viewUseCase.retrieveOne(id, MAPPER_ID_NAME);
    }
  
}
