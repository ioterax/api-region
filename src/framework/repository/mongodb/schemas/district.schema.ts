
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { City } from './city.schema';

export type CountryDocumentType = HydratedDocument<District>;

@Schema({ collection: 'districts' })
export class District {
    @Prop()
    name: string;
    @Prop()
    createdOn: Date;
    @Prop()
    changedOn: Date;
    @Prop()
    signature: string;
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: City.name })
    city: City;
}

export const DistrictSchema = SchemaFactory.createForClass(District);


