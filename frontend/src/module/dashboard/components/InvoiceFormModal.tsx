import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useInvoiceStore } from "@/store/invoice.store";
import { useCreateInvoice, useUpdateInvoice, useGetInvoiceById } from "@/api/hooks/invoice.hook";
import { invoiceFormSchema, type InvoiceFormValues } from "../../invoice/validators/invoice.validator";
import { generateInvoiceNumber } from "../../invoice/utils/invoice.utils";
import { CustomerDetailsForm } from "../../invoice/components/CustomerDetailsForm";
import { LineItemsTable } from "../../invoice/components/LineItemsTable";
import { InvoiceSummary } from "../../invoice/components/InvoiceSummary";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function InvoiceFormModal() {
  const { isModalOpen, modalMode, selectedInvoice, closeModal } = useInvoiceStore();
  const { mutate: createInvoice, isPending: isCreating } = useCreateInvoice();
  const { mutate: updateInvoice, isPending: isUpdating } = useUpdateInvoice();
  const { data: fetchedInvoice, isLoading: isFetchingInvoice } = useGetInvoiceById(selectedInvoice?._id);

  const isViewMode = modalMode === "view";
  const isEditMode = modalMode === "edit";
  const isCreateMode = modalMode === "create";

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: "",
      date: new Date().toISOString(),
      customerDetails: {
        fullName: "",
        phoneNumber: "",
        emailId: "",
        billingAddress: "",
      },
      items: [] as any[],
      totals: {
        subtotal: 0,
        totalDiscount: 0,
        totalGst: 0,
        grandTotal: 0,
      },
    },
  });

  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (isModalOpen) {
      if ((isEditMode || isViewMode) && fetchedInvoice) {
        reset({
          invoiceNumber: fetchedInvoice.invoiceNumber,
          date: fetchedInvoice.date || new Date().toISOString(),
          customerDetails: fetchedInvoice.customerDetails,
          items: fetchedInvoice.items.map((item: any) => ({
            itemId: typeof item.itemId === 'string' ? item.itemId : item.itemId._id,
            name: typeof item.itemId === 'object' ? item.itemId.name : "Product",
            quantity: item.quantity,
            gstPercentage: item.gstPercentage,
            discountType: item.discountType,
            discountValue: item.discountValue,
            basePrice: typeof item.itemId === 'object' ? (item.itemId.basePrice || 0) : ((Number(item.rowTotal) || 0) / (Number(item.quantity) || 1)),
            rowTotal: item.rowTotal,
          })),
          totals: fetchedInvoice.totals,
        });
        setDate(fetchedInvoice.date ? new Date(fetchedInvoice.date) : new Date());
      } else if (isCreateMode) {
        const invNum = generateInvoiceNumber();
        reset({
          invoiceNumber: invNum,
          date: new Date().toISOString(),
          customerDetails: {
            fullName: "",
            phoneNumber: "",
            emailId: "",
            billingAddress: "",
          },
          items: [],
          totals: {
            subtotal: 0,
            totalDiscount: 0,
            totalGst: 0,
            grandTotal: 0,
          },
        });
        setDate(new Date());
      }
    }
  }, [isModalOpen, isEditMode, isViewMode, isCreateMode, fetchedInvoice, reset]);

  const onSubmit = (data: InvoiceFormValues) => {
    if (isViewMode) return;

    // Clean data (remove extra 'name' and 'basePrice' fields from items if BE is strict)
    const cleanedPayload = {
      ...data,
      items: data.items.map(({ name, basePrice, ...rest }: any) => rest),
    } as any;

    if (isCreateMode) {
      createInvoice(cleanedPayload, {
        onSuccess: () => closeModal(),
      });
    } else if (isEditMode && selectedInvoice) {
      updateInvoice(
        { id: selectedInvoice._id, payload: cleanedPayload },
        {
          onSuccess: () => closeModal(),
        }
      );
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] p-0 flex flex-col gap-0 border-none rounded-xl shadow-2xl overflow-hidden">
        <DialogHeader className="p-6 bg-background border-b z-20 sticky top-0">
          <div className="flex justify-between items-center pr-4">
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {isCreateMode && "Create New Invoice"}
                {isEditMode && "Edit Invoice"}
                {isViewMode && "Invoice Details"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Manage invoice details, items, and calculations in one place.
              </p>
            </div>
            {isViewMode && (
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>
        </DialogHeader>

        {isFetchingInvoice ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-10">
            {/* Meta Section: ID & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/20 p-6 rounded-xl border border-dashed">
              <div className="grid gap-2">
                <Label htmlFor="inv-num">Invoice Number</Label>
                <div className="h-10 flex items-center px-3 bg-muted font-mono font-bold rounded-md">
                   {watch("invoiceNumber")}
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Invoice Date</Label>
                {isViewMode ? (
                   <div className="h-10 flex items-center px-3 bg-muted/50 rounded-md font-medium">
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {date ? format(date, "PPP") : "-"}
                   </div>
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-10 bg-background",
                          !date && "text-muted-foreground"
                        )}
                        disabled={isPending}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => {
                          setDate(newDate);
                          if (newDate) setValue("date", newDate.toISOString());
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>

            {/* Customer Section */}
            <CustomerDetailsForm
              register={register}
              errors={errors}
              disabled={isPending}
              isViewMode={isViewMode}
              control={control}
            />

            {/* Line Items Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-1 bg-primary rounded-full"></div>
                <h3 className="text-sm font-bold uppercase tracking-wider">Line Items</h3>
              </div>
              <LineItemsTable
                control={control}
                register={register}
                errors={errors}
                setValue={setValue}
                disabled={isPending}
                isViewMode={isViewMode}
              />
            </div>

            {/* Summary Section */}
            <div className="flex justify-end pt-6 border-t">
              <div className="w-full md:w-1/2">
                <InvoiceSummary control={control} setValue={setValue} />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-muted/40 border-t sticky bottom-0 z-20">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={isPending}
              className="px-8 tracking-wide"
            >
              {isViewMode ? "Close" : "Cancel"}
            </Button>
            {!isViewMode && (
              <Button type="submit" disabled={isPending} className="px-10 font-bold shadow-lg shadow-primary/20">
                {isPending ? "Processing..." : isCreateMode ? "Generate Invoice" : "Save Changes"}
              </Button>
            )}
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
