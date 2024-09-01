import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { StateUseCase } from '../usescases/state.usecase';
import { InjectModel } from '@nestjs/mongoose';
import { State } from '@/framework/repository/schemas/state.schema';

@Injectable()
export class StateService implements StateUseCase {

  constructor(@InjectModel(State.name) private stateModel: Model<State>) {}
  
  async create(state: State): Promise<State> {
    const stateModel = new this.stateModel(state);
    return stateModel.save();
  }
  
  delete(id: string) {
    throw new Error('Method not implemented.');
  }
  
  async findAll(): Promise<State[]> {
    console.log('getState');
    return this.stateModel.aggregate([
      { $lookup:
        {
          from: 'countries',
          localField: 'country',
          foreignField: '_id',
          as: 'country'
        } },
        { $unwind: "$country" }
   ]).exec();
  }

  findOne(id: String): Promise<State> {
    throw new Error('Method not implemented.');
  }

}
