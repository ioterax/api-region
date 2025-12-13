import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ICountry, IState } from '@ioterax/foundation-lib-central';
import { applyDefaultTransform } from '@ioterax/infra-lib-database';
import { Country } from './country.schema';

@Schema({ collection: 'states' })
export class State implements IState {
  id!: string;

  @Prop()
  code!: string;

  @Prop()
  name!: string;

  @Prop()
  areaCode!: number;

  @Prop()
  hasDST!: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Country.name })
  country!: ICountry;

  /**
   * @property {Date} createdAt - Timestamp when the client was created.
   */
  @Prop({
    required: true,
    index: true,
    unique: true,
    default: () => new Date().toISOString(),
  })
  createdAt!: Date;

  /**
   * @property {Date} changedAt - Timestamp of the last modification to the client.
   */
  @Prop({
    required: true,
    index: true,
    unique: true,
    default: () => new Date().toISOString(),
  })
  changedAt!: Date;

  @Prop({ required: true, default: () => new Date().toISOString() })
  updatedAt!: Date;

  @Prop({ type: Date, required: false, default: null })
  revokedAt?: Date | null;

  /**
   * @property {string} signature - Unique signature hash for the client.
   */
  @Prop({ required: true })
  signature!: string;
}

export type StateDocumentType = HydratedDocument<State>;
export const StateSchema = SchemaFactory.createForClass(State);
applyDefaultTransform(StateSchema);

//TODO: CREATE INDEXES IF NEEDED
