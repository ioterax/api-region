import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CountryOutPort } from "@/application/ports/out/country.out.port";
import { Country } from "@/framework/repository/mongodb/schemas/country.schema";
import { setTrace } from '@/common/common';

console.log(`>>>>>>>>>>> ${process.env.MONGO_REGION_CN_NAME}`);

@Injectable()
export class CountryMongoDbRepository implements CountryOutPort {

    constructor(@InjectModel(Country.name, process.env.MONGO_REGION_CN_NAME) private domainModel: Model<Country>) {}

    async save(domain: Country): Promise<Country> {
        const e = setTrace(domain, true);
        console.log(e);
    
        const domainModel = new this.domainModel(e);
        const r = await domainModel.save();
        console.log(r);
        return r;    
    }

    findAll(project: Country | {}): Promise<Country[]> {
        return this.domainModel.find({}, project).exec();
    }

    findById(id: string, project: Country | {}): Promise<Country | null> {
        return this.domainModel.findById(id, project).exec();
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
