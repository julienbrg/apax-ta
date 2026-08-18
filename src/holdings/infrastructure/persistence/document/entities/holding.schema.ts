import mongoose from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';
import { AssetTypeEnum } from '../../../../asset-type.enum';

export type HoldingSchemaDocument = HydratedDocument<HoldingSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class HoldingSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSchemaClass',
  })
  user?: string;

  @Prop({
    type: Number,
  })
  amount: number;

  @Prop({
    type: String,
    enum: Object.values(AssetTypeEnum),
  })
  assetType: AssetTypeEnum;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;
}

export const HoldingSchema = SchemaFactory.createForClass(HoldingSchemaClass);
