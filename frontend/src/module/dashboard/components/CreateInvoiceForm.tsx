import { useCreateInvoice } from "@/api/hooks/invoice.hook";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2, FileText } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { generateInvoiceNumber } from "../../invoice/utils/invoice.utils";
import { invoiceFormSchema, type InvoiceFormValues } from "../../invoice/validators/invoice.validator";
import { CustomerDetailsForm } from "../../invoice/components/CustomerDetailsForm";
import { InvoiceSummary } from "../../invoice/components/InvoiceSummary";
import { LineItemsTable } from "../../invoice/components/LineItemsTable";

export function CreateInvoiceForm() {
  const { mutate: createInvoice, isPending, isSuccess, reset: resetMutation } = useCreateInvoice();

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
      invoiceNumber: generateInvoiceNumber(),
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
      status: "pending" as const,
    },
  });
  const [date, setDate] = useState<Date | undefined>(new Date());

  const resetForm = () => {
    reset({
      invoiceNumber: generateInvoiceNumber(),
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
      status: "pending",
    });
    setDate(new Date());
    resetMutation();
  };

  const onSubmit = (data: InvoiceFormValues) => {
    const cleanedPayload = {
      ...data,
      status: data.status || "pending",
      items: data.items.map(({ name, basePrice, ...rest }: any) => rest),
    } as any;

    createInvoice(cleanedPayload);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="rounded-full bg-emerald-500/10 p-6">
          <CheckCircle2 className="h-16 w-16 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Invoice Generated Successfully!</h2>
        <p className="text-muted-foreground max-w-sm">
          Your invoice has been created and securely saved to the database.
        </p>
        <div className="flex gap-4 mt-8">
          <Button variant="outline" onClick={resetForm} className="px-8 shadow-sm">
            Create Another
          </Button>
          <Button className="px-8 shadow-lg shadow-primary/20 gap-2">
            <FileText className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 pb-20">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold tracking-tight">Invoice Details</h3>
        <p className="text-sm text-muted-foreground">Configure the core details of this invoice.</p>
      </div>

      {/* Meta Section: ID & Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-xl border border-dashed shadow-sm">
        <div className="grid gap-2">
          <Label htmlFor="inv-num">Invoice Number</Label>
          <Input
            id="inv-num"
            {...register("invoiceNumber")}
            disabled={true}
            className="bg-muted/50 font-mono font-bold tracking-wider"
          />
        </div>

        <div className="grid gap-2">
          <Label>Date of Issue</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal h-10 bg-background shadow-sm",
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
          {errors.date && (
            <span className="text-[10px] uppercase font-bold text-destructive">{errors.date.message as any}</span>
          )}
        </div>
      </div>

      <div className="h-px w-full bg-border" />

      {/* Customer Section */}
      <CustomerDetailsForm
        register={register}
        errors={errors}
        disabled={isPending}
      />

      <div className="h-px w-full bg-border" />

      {/* Line Items Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-6 w-1 bg-primary rounded-full"></div>
          <h3 className="text-lg font-bold tracking-tight">Line Items</h3>
        </div>
        <LineItemsTable
          control={control}
          register={register}
          errors={errors}
          setValue={setValue}
          disabled={isPending}
        />
      </div>

      <div className="h-px w-full bg-border" />

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-6">
        <div className="space-y-4 bg-muted/20 p-6 rounded-xl border border-dashed">
          <Label className="text-sm font-medium">Invoice Status</Label>
          <Select
            disabled={isPending}
            value={watch("status")}
            onValueChange={(val: any) => setValue("status", val)}
          >
            <SelectTrigger className="w-full bg-background shadow-sm h-10">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <InvoiceSummary control={control} setValue={setValue} />
      </div>

      {/* Action Bar */}
      <div className="sticky bottom-6 z-10 p-4 bg-background/80 backdrop-blur-md border rounded-2xl shadow-2xl flex justify-between items-center mt-12 animate-in slide-in-from-bottom-6">
        <p className="text-sm text-muted-foreground px-4 hidden sm:block">
          Please double-check the line items and customer details before generating.
        </p>
        <Button
          type="submit"
          disabled={isPending}
          size="lg"
          className="w-full sm:w-auto px-12 font-bold shadow-lg shadow-primary/30"
        >
          {isPending ? "Generating Invoice..." : "Finalize & Generate Invoice"}
        </Button>
      </div>
    </form>
  );
}
