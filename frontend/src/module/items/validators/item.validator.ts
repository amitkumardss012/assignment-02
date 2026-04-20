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
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  basePrice: z.number().min(0.01, "Base price must be greater than 0"),
  variants: z.array(itemVariantSchema),
});
