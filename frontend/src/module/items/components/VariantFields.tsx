import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";

interface VariantFieldsProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  disabled?: boolean;
}

export function VariantFields({ control, register, errors, disabled }: VariantFieldsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-base font-semibold">Variants</Label>
          <p className="text-[0.8rem] text-muted-foreground">Add specific options like Size, Color, or Weight.</p>
        </div>
        {!disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ type: "", value: "" })}
            className="h-8 border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Variant
          </Button>
        )}
      </div>

      {fields.length === 0 && (
        <div className="flex h-16 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground italic">
          No variants added yet.
        </div>
      )}

      <div className="grid gap-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid flex-1 gap-1.5">
              <Input
                {...register(`variants.${index}.type` as const)}
                disabled={disabled}
                placeholder="Type (e.g. Size)"
                className="h-9"
              />
              {errors.variants?.[index]?.type && (
                <p className="text-[0.7rem] font-medium text-destructive">
                  {errors.variants[index]?.type?.message}
                </p>
              )}
            </div>
            <div className="grid flex-1 gap-1.5">
              <Input
                {...register(`variants.${index}.value` as const)}
                disabled={disabled}
                placeholder="Value (e.g. Large)"
                className="h-9"
              />
              {errors.variants?.[index]?.value && (
                <p className="text-[0.7rem] font-medium text-destructive">
                  {errors.variants[index]?.value?.message}
                </p>
              )}
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
