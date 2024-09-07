import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { StateOutPort } from "@/application/ports/out/state.out.port";
import { State } from "@atisiothings/laniakea-lib-central/dist/domain/region";
import { setTrace } from '@/common/common';

export class StateMongoRepository implements StateOutPort {

    constructor(@InjectModel(State.name, process.env.MONGO_REGION_CN_NAME) private domainModel: Model<State>) {}

    save(domain: State): Promise<State> {
      // fix: IState
      const domainModel = new this.domainModel(domain);
      return domainModel.save();    
    }
    
    findAll(): Promise<State[]> {
        console.log('getState');
        return this.domainModel.aggregate([
          { $lookup:
            {
              from: 'countries',
              localField: 'country',
              foreignField: '_id',
              as: 'country'
            } },
            { $unwind: { path: "$country", preserveNullAndEmptyArrays: true } },
       ]).exec();    
    }

    findById(id: String): Promise<State | null> {
        console.log('getState');
        return this.domainModel.aggregate([
          { $match: { _id:  id } },
          { $lookup:
            {
              from: 'countries',
              localField: 'country',
              foreignField: '_id',
              as: 'country'
            } },
            { $unwind: { path: "$country", preserveNullAndEmptyArrays: true } },
       ]).exec()[0];
    }
    
    async updateById(id: String, domain: State): Promise<State | null> {
      const filter  = { _id: id };
      return await this.domainModel.findByIdAndUpdate(filter, {...domain}, {new: true}).exec();
    }
    
    async deleteById(id: String) {
      const filter  = { _id: id };
      await this.domainModel.findByIdAndDelete(filter)
    }
}
