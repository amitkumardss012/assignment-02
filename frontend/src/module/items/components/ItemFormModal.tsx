import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useItemStore } from "@/store/item.store";
import { useCreateItem, useUpdateItem } from "@/api/hooks/item.hook";
import { itemFormSchema, type ItemFormValues, type ItemVariant } from "../validators/item.validator";
import { VariantFields } from "./VariantFields";

export function ItemFormModal() {
  const { isModalOpen, modalMode, selectedItem, closeModal } = useItemStore();
  const { mutate: createItem, isPending: isCreating } = useCreateItem();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateItem();

  const isViewMode = modalMode === "view";
  const isEditMode = modalMode === "edit";
  const isCreateMode = modalMode === "create";

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      variants: [] as ItemVariant[],
    },
  });

  const handleReset = useCallback(() => {
    if ((isEditMode || isViewMode) && selectedItem) {
      reset({
        name: selectedItem.name,
        description: selectedItem.description,
        basePrice: selectedItem.basePrice,
        variants: selectedItem.variants.map((v) => ({ 
          type: v.type, 
          value: v.value 
        })),
      });
    } else {
      reset({
        name: "",
        description: "",
        basePrice: 0,
        variants: [],
      });
    }
  }, [isEditMode, isViewMode, selectedItem, reset]);

  // Handle modal state changes
  useEffect(() => {
    if (isModalOpen) {
      handleReset();
    }
  }, [isModalOpen, handleReset]);

  const onSubmit = (data: ItemFormValues) => {
    if (isViewMode) return;

    if (isCreateMode) {
      createItem(data, {
        onSuccess: () => closeModal(),
      });
    } else if (isEditMode && selectedItem) {
      updateItem(
        { id: selectedItem._id, payload: data },
        {
          onSuccess: () => closeModal(),
        }
      );
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden outline-none border-none shadow-2xl pb-5">
        <DialogHeader className="p-6 pb-2 space-y-1 bg-background">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {isCreateMode && "Create New Product"}
            {isEditMode && "Edit Product"}
            {isViewMode && "Product Details"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {isCreateMode && "Enter the details for your new inventory item."}
            {isEditMode && "Update the information for this product."}
            {isViewMode && "You are currently in read-only mode for this product."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
          <div className="p-6 py-4 space-y-5 max-h-[65vh] overflow-y-auto scrollbar-thin">
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-medium">Product Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  disabled={isViewMode || isPending}
                  placeholder="Enter product name"
                  className={errors.name ? "border-destructive ring-destructive/20" : ""}
                />
                {errors.name && (
                  <span className="text-[10px] uppercase font-bold text-destructive tracking-wider">{errors.name.message}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="basePrice" className="text-sm font-medium">Base Price (INR)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    {...register("basePrice", { valueAsNumber: true })}
                    disabled={isViewMode || isPending}
                    placeholder="0.00"
                    className={errors.basePrice ? "border-destructive ring-destructive/20" : ""}
                  />
                  {errors.basePrice && (
                    <span className="text-[10px] uppercase font-bold text-destructive tracking-wider">{errors.basePrice.message}</span>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  disabled={isViewMode || isPending}
                  placeholder="Describe your product..."
                  className={`min-h-[100px] resize-none ${errors.description ? "border-destructive ring-destructive/20" : ""}`}
                />
                {errors.description && (
                  <span className="text-[10px] uppercase font-bold text-destructive tracking-wider">{errors.description.message}</span>
                )}
              </div>
            </div>

            <VariantFields 
              control={control} 
              register={register} 
              errors={errors} 
              disabled={isViewMode || isPending} 
            />
          </div>

          <DialogFooter className="p-4 px-6 bg-muted/40 border-t flex flex-row justify-end items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={isPending}
              className="px-6 h-9 text-xs font-semibold uppercase tracking-wider"
            >
              {isViewMode ? "Close" : "Cancel"}
            </Button>
            {!isViewMode && (
              <Button type="submit" disabled={isPending} className="px-8 h-9 text-xs font-semibold uppercase tracking-wider">
                {isPending ? "Processing..." : isCreateMode ? "Add Item" : "Update Item"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
