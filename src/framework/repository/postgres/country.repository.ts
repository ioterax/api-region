import { Repository } from 'typeorm';

import { CountryOutPort } from "@/application/ports/out/country.out.port";

import { Country } from './entities/country.entity';
import { Injectable } from '@nestjs/common';
import { ICountry } from '@atisiothings/laniakea-lib-central/dist/domain/region';

@Injectable()
export class CountryPostgresRepository extends Repository<Country> implements CountryOutPort {

    updateById(id: String, domain: ICountry): Promise<ICountry | null> {
        throw new Error('Method not implemented.');
    }
    deleteById(id: String) {
        throw new Error('Method not implemented.');
    }
    findAll(project?: {} | ICountry | undefined): Promise<ICountry[]> {
        throw new Error('Method not implemented.');
    }
    findById(id: String, queryFields?: {} | ICountry | undefined, project?: {} | ICountry | undefined): Promise<ICountry | null> {
        throw new Error('Method not implemented.');
    }

    

    // async save(domain: Country): Promise<Country> {
    // }

    // findAll(project: Country | {}): Promise<Country[]> {
    // }

    // findById(id: string, project: Country | {}): Promise<Country | null> {
    // }

    // async updateById(id: string, domain: Country): Promise<Country | null> {    
    // }

    // async deleteById(id: string) {
    // }
    
}
