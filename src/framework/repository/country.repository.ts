import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CountryOutPort } from "@/application/ports/out/country.out.port";
import { Country } from "@/framework/repository/schemas/country.schema";
import { setTrace } from '@/common/common';

export class CountryRepository implements CountryOutPort {

    constructor(@InjectModel(Country.name) private countryModel: Model<Country>) {}

    async save(country: Country): Promise<Country> {
        const e = setTrace(country, true);
        console.log(e);
    
        const countryModel = new this.countryModel(e);
        const r = await countryModel.save();
        console.log(r);
        return r;    
    }

    findAll(): Promise<Country[]> {
        return this.countryModel.find().exec();
    }

    findById(id: string): Promise<Country | null> {
        return this.countryModel.findById(id).exec();
    }

    async updateById(id: string, country: Country): Promise<Country | null> {
        const e = setTrace(country);
        // console.log(e);
    
        const filter  = { _id: id };
    
        // console.log(filter);
        // console.log({...country});
    
        const countryModel = new this.countryModel(e);
        // console.log(countryModel);
    
        const x = await this.countryModel.findByIdAndUpdate(filter, {...country}, {new: true}).exec();
        console.log(x);
        return x;
    
    }
    async deleteById(id: string) {
        const filter  = { _id: id };
        await this.countryModel.findByIdAndDelete(filter)

    }
    
}
