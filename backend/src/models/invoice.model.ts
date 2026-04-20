import mongoose, { Document, Schema, Types } from "mongoose";
import type { LineItemType } from "../validators/invoice.validator.js";

// Line Item Interface
export interface ILineItem extends Document {
  itemId: Types.ObjectId;
  quantity: number;
  gstPercentage: number;
  discountType: "percentage" | "amount";
  discountValue: number;
  rowTotal: number;
}

// Invoice Interface
export interface IInvoice extends Document {
  invoiceNumber: string;

  customerDetails: { 
    fullName: string;
    phoneNumber: string;
    emailId: string;
    billingAddress: string;
  };

  items: LineItemType[];

  totals: {
    subtotal: number;
    totalDiscount: number;
    totalGst: number;
    grandTotal: number;
  };

  status: "pending" | "paid" | "overdue";

  date?: Date | undefined;

  createdAt: Date;
  updatedAt: Date;
}

// Line Item Schema
const LineItemSchema = new Schema<ILineItem>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: "Item" },

    quantity: { type: Number, required: true, min: 1 },

    gstPercentage: {
      type: Number,
      enum: [0, 5, 12, 18, 28],
      required: true,
    },

    discountType: {
      type: String,
      enum: ["percentage", "amount"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    rowTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

// Invoice Schema
const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    customerDetails: {
      fullName: { type: String, required: true, trim: true },
      phoneNumber: { type: String, required: true, trim: true },
      emailId: { type: String, required: true, trim: true },
      billingAddress: { type: String, required: true, trim: true },
    },

    items: {
      type: [LineItemSchema],
      required: true,
    },

    totals: {
      subtotal: { type: Number, required: true, min: 0 },
      totalDiscount: { type: Number, required: true, min: 0 },
      totalGst: { type: Number, required: true, min: 0 },
      grandTotal: { type: Number, required: true, min: 0 },
    },

    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },

    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Invoice = mongoose.model<IInvoice>("Invoice", InvoiceSchema);

export default Invoice;