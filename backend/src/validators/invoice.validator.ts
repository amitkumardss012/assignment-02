import { Schema } from "mongoose";
import { z } from "zod";


// Line Item Validator
const lineItemSchema = z
  .object({
    itemId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Item ID"),

    quantity: z.coerce.number().min(1),

    gstPercentage: z.coerce
      .number()
      .refine((val) => [0, 5, 12, 18, 28].includes(val), {
        message: "Invalid GST percentage",
      }),

    discountType: z.enum(["percentage", "amount"]),

    discountValue: z.coerce.number().min(0),

    rowTotal: z.coerce.number().min(0),
  })
  .refine(
    (data) => {
      if (data.discountType === "percentage") {
        return data.discountValue <= 100;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["discountValue"],
    },
);
  
export type LineItemType = z.infer<typeof lineItemSchema>;

// Invoice Validator
export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1).trim(),
  customerDetails: z.object({
    fullName: z.string().min(1).trim(),

    phoneNumber: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),

    emailId: z.string().email().toLowerCase().trim(),

    billingAddress: z.string().min(1).trim(),
  }),

  totals: z.object({
    subtotal: z.coerce.number().min(0),
    totalDiscount: z.coerce.number().min(0).default(0),
    totalGst: z.coerce.number().min(0),
    grandTotal: z.coerce.number().min(0),
  }),

  items: z.array(lineItemSchema).min(1), 
  status: z.enum(["pending", "paid", "overdue"]).default("pending"),

  date: z.coerce.date().optional(),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;

export const updateInvoiceSchema = invoiceSchema.partial();
export type UpdateInvoiceType = z.infer<typeof updateInvoiceSchema>;
