
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Country } from './country.schema';
import { ICountry, IState } from '@atisiothings/laniakea-lib-central/dist/central';

export type StateDocumentType = HydratedDocument<State>;

@Schema({ collection: 'states' })
export class State implements IState {
    _id: string;
    @Prop()    
    name: string;
    @Prop()
    areaCode: number;
    @Prop()
    hasDST: boolean;
    @Prop()
    createdOn: Date;
    @Prop()
    changedOn: Date;
    @Prop()
    signature: string;
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: Country.name })
    country: ICountry;
}

export const StateSchema = SchemaFactory.createForClass(State);
