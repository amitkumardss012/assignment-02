import { z } from "zod";

export const itemSchema = z.object({
  name: z
    .string()
    .min(1, "Item name is required")
    .max(100)
    .trim(),

  description: z
    .string()
    .min(1, "Description is required")
    .max(500)
    .trim(),

  variants: z
    .array(
      z.object({
        type: z.string().min(1),   // e.g. Size, Color
        value: z.string().min(1),  // e.g. Large, Red
      })
    )
    .default([]),

  basePrice: z.coerce
    .number()
    .min(0, "Base price cannot be negative"),
});

export type ItemType = z.infer<typeof itemSchema>;

export const updateItemSchema = itemSchema.partial();
export type UpdateItemType = z.infer<typeof updateItemSchema>;