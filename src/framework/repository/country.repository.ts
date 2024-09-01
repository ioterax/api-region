import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CountryOutPort } from "@/application/ports/out/country.out.port";
import { Country } from "@/framework/repository/schemas/country.schema";
import { setTrace } from '@/common/common';

export class CountryRepository implements CountryOutPort {

    constructor(@InjectModel(Country.name) private domainModel: Model<Country>) {}

    async save(domain: Country): Promise<Country> {
        const e = setTrace(domain, true);
        console.log(e);
    
        const domainModel = new this.domainModel(e);
        const r = await domainModel.save();
        console.log(r);
        return r;    
    }

    findAll(): Promise<Country[]> {
        return this.domainModel.find().exec();
    }

    findById(id: string): Promise<Country | null> {
        return this.domainModel.findById(id).exec();
    }

    async updateById(id: string, domain: Country): Promise<Country | null> {
        const e = setTrace(domain);
        // console.log(e);
    
        const filter  = { _id: id };
    
        // console.log(filter);
        // console.log({...country});
    
        const domainModel = new this.domainModel(e);
        // console.log(domainModel);
    
        const x = await this.domainModel.findByIdAndUpdate(filter, {...domain}, {new: true}).exec();
        console.log(x);
        return x;
    
    }
    async deleteById(id: string) {
        const filter  = { _id: id };
        await this.domainModel.findByIdAndDelete(filter)

    }
    
}
