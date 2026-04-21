import * as z from "zod";

export type ItemVariant = {
  type: string;
  value: string;
};

export type ItemFormValues = {
  name: string;
  description: string;
  basePrice: number;
  variants: ItemVariant[];
};

export const itemVariantSchema = z.object({
  type: z.string().min(1, "Variant type is required"),
  value: z.string().min(1, "Variant value is required"),
});

export const itemFormSchema = z.object({
  name: z.string().min(1, "Item name is required").max(100).trim(),
  description: z.string().min(1, "Description is required").max(500).trim(),
  basePrice: z.number().min(0, "Base price cannot be negative"),
  variants: z.array(itemVariantSchema).default([]),
});
