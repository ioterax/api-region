/* eslint-disable @typescript-eslint/no-empty-object-type */
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IState } from '@ioterax/foundation-lib-central';
import { StateOutPort } from '@/application/ports/out/state.port';
import { State } from './schemas/state.schema';

export class StateMongoRepository implements StateOutPort {
  constructor(
    @InjectModel(State.name, process.env.MONGO_REGION_CN_NAME)
    private domainModel: Model<State>,
  ) {}

  save(domain: IState): Promise<IState> {
    // fix: IState
    const domainModel = new this.domainModel(domain);
    return domainModel.save();
  }

  findAll(): Promise<IState[]> {
    console.log('getState');
    return this.domainModel
      .aggregate([
        {
          $lookup: {
            from: 'countries',
            localField: 'country',
            foreignField: '_id',
            as: 'country',
          },
        },
        { $unwind: { path: '$country', preserveNullAndEmptyArrays: true } },
      ])
      .exec();
  }

  async findById(id: string, project?: Record<string, 0 | 1>): Promise<IState | null> {
    const pipeline: any[] = [
      { $match: { _id: id } },
      {
        $lookup: {
          from: 'countries',
          localField: 'country',
          foreignField: '_id',
          as: 'country',
        },
      },
      { $unwind: { path: '$country', preserveNullAndEmptyArrays: true } },
    ];

    // ✅ Optional projection
    if (project && Object.keys(project).length > 0) {
      pipeline.push({ $project: project });
    }

    const result = await this.domainModel.aggregate(pipeline).exec();

    return result[0] ?? null;
  }

  async updateById(id: string, domain: State): Promise<State | null> {
    const filter = { _id: id };
    return await this.domainModel.findByIdAndUpdate(filter, { ...domain }, { new: true }).exec();
  }

  async deleteById(id: string) {
    const filter = { _id: id };
    await this.domainModel.findByIdAndDelete(filter);
  }
}
