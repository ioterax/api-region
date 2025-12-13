// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
// import { State } from './state.schema';

// export type CountryDocumentType = HydratedDocument<City>;

// @Schema({ collection: 'cities' })
// export class City {
//     @Prop()
//     code: number;
//     @Prop()
//     name: string;
//     @Prop()
//     postalCode: number;
//     @Prop()
//     createdOn: Date;
//     @Prop()
//     changedOn: Date;
//     @Prop()
//     signature: string;
//     @Prop({ type: MongooseSchema.Types.ObjectId, ref: State.name })
//     state: State;
// }

// export const CitySchema = SchemaFactory.createForClass(City);
