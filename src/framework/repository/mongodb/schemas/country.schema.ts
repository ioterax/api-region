import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ICountry } from '@atisiothings/laniakea-lib-central/dist/domain/region';

export type CountryDocumentType = HydratedDocument<Country>;

@Schema({ collection: 'countries' })
export class Country implements ICountry {
    _id: string;
    @Prop({ required: true, index: true, unique: true })
    code: number;
    @Prop({ required: true, index: true, unique: true })
    name: string;
    @Prop({ required: true, index: true, unique: true })
    mcc: number;
    @Prop({ required: true, index: true })
    initials: string;
    // @Prop({ required: true })
    // language: string;
    @Prop({ required: true, index: true, unique: true })
    createdOn: Date;
    @Prop({ required: true, index: true, unique: true })
    changedOn: Date;
    @Prop({ required: true })
    signature: string;
}

export const CountrySchema = SchemaFactory.createForClass(Country);
// CountrySchema.index({});

