import mongoose, { Document, Schema } from "mongoose";
import type { ItemType } from "../validators/item.validator.js";

interface IVariant {
  type: string;
  value: string;
}

export interface IItem extends Document {
  name: string;
  description: string;
  variants: IVariant[];
  basePrice: number;
}

const VariantSchema = new Schema<IVariant>(
  {
    type: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

const ItemSchema = new Schema<IItem>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    variants: {
      type: [VariantSchema],
      default: [],
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Item =  mongoose.model<ItemType>("Item", ItemSchema);

export default Item;