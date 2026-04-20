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
  totalDiscount: number;
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

export const lineItemSchema = z.object({
  itemId: z.string().min(1, "Item selection is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  gstPercentage: z.number().min(0, "GST percentage cannot be negative"),
  discountType: z.enum(["percentage", "amount"]),
  discountValue: z.number().min(0, "Discount cannot be negative"),
  basePrice: z.number().min(0),
  rowTotal: z.number().min(0),
});

export const customerDetailsSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  emailId: z.string().email("Invalid email address"),
  billingAddress: z.string().min(5, "Billing address is required"),
});

export const invoiceTotalsSchema = z.object({
  subtotal: z.number().min(0),
  totalDiscount: z.number().min(0),
  totalGst: z.number().min(0),
  grandTotal: z.number().min(0),
});

export const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  date: z.string().min(1, "Date is required"),
  customerDetails: customerDetailsSchema,
  items: z.array(lineItemSchema).min(1, "At least one item is required"),
  totals: invoiceTotalsSchema,
  status: z.enum(["pending", "paid", "overdue"]).default("pending"),
});
