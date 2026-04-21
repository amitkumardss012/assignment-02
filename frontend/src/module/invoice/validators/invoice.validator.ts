import * as z from "zod";

export type LineItemValues = {
  itemId: string;
  quantity: number;
  gstPercentage: number;
  discountType: "percentage" | "amount";
  discountValue: number;
  basePrice: number;
  rowTotal: number;
  name?: string; // Opt-in for display
};

export type CustomerDetailsValues = {
  fullName: string;
  phoneNumber: string;
  emailId: string;
  billingAddress: string;
};

export type InvoiceTotalsValues = {
  subtotal: number;
  totalDiscount?: number;
  totalGst: number;
  grandTotal: number;
};

export type InvoiceFormValues = {
  invoiceNumber: string;
  date: string;
  customerDetails: CustomerDetailsValues;
  items: LineItemValues[];
  totals: InvoiceTotalsValues;
  status?: "pending" | "paid" | "overdue";
};

export const lineItemSchema = z
  .object({
    itemId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Item ID"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    gstPercentage: z
      .number()
      .refine((val) => [0, 5, 12, 18, 28].includes(val), {
        message: "Invalid GST percentage",
      }),
    discountType: z.enum(["percentage", "amount"]),
    discountValue: z.number().min(0, "Discount cannot be negative"),
    basePrice: z.number().min(0),
    rowTotal: z.number().min(0),
    name: z.string().optional(),
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
    }
  );

export const customerDetailsSchema = z.object({
  fullName: z.string().min(1, "Full name is required").trim(),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  emailId: z.string().email("Invalid email address").toLowerCase().trim(),
  billingAddress: z.string().min(1, "Billing address is required").trim(),
});

export const invoiceTotalsSchema = z.object({
  subtotal: z.number().min(0),
  totalDiscount: z.number().min(0).default(0),
  totalGst: z.number().min(0),
  grandTotal: z.number().min(0),
});

export const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required").trim(),
  date: z.string().min(1, "Date is required"),
  customerDetails: customerDetailsSchema,
  items: z.array(lineItemSchema).min(1, "At least one item is required"),
  totals: invoiceTotalsSchema,
  status: z.enum(["pending", "paid", "overdue"]).default("pending"),
});
