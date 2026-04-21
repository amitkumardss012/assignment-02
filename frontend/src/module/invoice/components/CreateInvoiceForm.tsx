import { useCreateInvoice } from "@/api/hooks/invoice.hook";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { CalendarIcon, CheckCircle2, FileText, Loader2, Send } from "lucide-react";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { generateInvoiceNumber } from "../utils/invoice.utils";
import { invoiceFormSchema, type InvoiceFormValues } from "../validators/invoice.validator";
import { AvailableItemsList } from "./AvailableItemsList";
import { CustomerDetailsForm } from "./CustomerDetailsForm";
import { InvoicePDFTemplate } from "./InvoicePDFTemplate";
import { InvoiceSummary } from "./InvoiceSummary";
import { SelectedItemsList } from "./LineItemsTable";

export function CreateInvoiceForm() {
  const { mutate: createInvoice, isPending, isSuccess, reset: resetMutation } = useCreateInvoice();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(invoiceFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSnapshot, setPdfSnapshot] = useState<InvoiceFormValues | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return;
    
    // Safety check - use snapshot if available, otherwise fallback to watch
    const currentData = pdfSnapshot || watch();
    if (!currentData.items || currentData.items.length === 0) {
      alert("Invoice has no items to download.");
      return;
    }

    try {
      setIsGeneratingPdf(true);
      // Extra delay for stability
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const element = pdfRef.current;
      const dataUrl = await toPng(element, { 
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 3, // Higher quality
        style: {
          opacity: '1',
          visibility: 'visible',
        }
      });

      if (!dataUrl) throw new Error("PDF Capture failed");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4"
      });
      
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${currentData.invoiceNumber || "Invoice"}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Something went wrong while generating the PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

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
      status: "pending" as const,
    });
    setDate(new Date());
    resetMutation();
  };

  const onSubmit = (data: InvoiceFormValues) => {
    // Capture snapshot for PDF generation before inputs are unmounted
    setPdfSnapshot(data);

    const cleanedPayload = {
      ...data,
      items: data.items.map(({ name, basePrice, ...rest }: any) => rest),
    } as any;

    createInvoice(cleanedPayload);
  };

  const handleAddItem = (item: any) => {
    const currentItems = watch("items") || [];
    const existingItemIndex = currentItems.findIndex((i: any) => i.itemId === item._id);

    if (existingItemIndex !== -1) {
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: (updatedItems[existingItemIndex].quantity || 1) + 1,
      };
      setValue("items", updatedItems, { shouldValidate: true });
    } else {
      setValue("items", [
        ...currentItems,
        {
          name: item.name,
          itemId: item._id,
          quantity: 1,
          gstPercentage: 0,
          discountType: "percentage",
          discountValue: 0,
          basePrice: item.basePrice,
          rowTotal: item.basePrice,
        },
      ], { shouldValidate: true });
    }
    trigger("items");
  };

  const renderContent = () => {
    if (isSuccess) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="rounded-full bg-emerald-500/10 p-6 ring-8 ring-emerald-500/5">
            <CheckCircle2 className="h-16 w-16 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Invoice Generated!</h2>
          <p className="text-muted-foreground max-w-sm">
            The transaction has been recorded successfully. You can now download the PDF or create a new invoice.
          </p>
          <div className="flex gap-4 mt-8">
            <Button variant="outline" onClick={resetForm} className="px-8 shadow-sm h-12 rounded-xl">
              Create Another
            </Button>
            <Button 
              onClick={handleDownloadPdf} 
              disabled={isGeneratingPdf} 
              className="px-8 shadow-lg shadow-primary/20 gap-2 h-12 rounded-xl bg-primary hover:bg-primary/90"
            >
              {isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Download PDF
            </Button>
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full space-y-6">
        {/* Top Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20 p-6 rounded-2xl border border-dashed shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Invoice Number: {watch("invoiceNumber")}</p>
          </div>

          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant={"outline"}
                  className={cn(
                    "w-[200px] justify-start text-left font-bold h-11 bg-background shadow-sm rounded-xl border-border/50",
                    !date && "text-muted-foreground"
                  )}
                  disabled={isPending}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {date ? format(date, "PPP") : <span>Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Product Selection */}
          <div className="lg:col-span-4 h-[1000px]">
            <AvailableItemsList onAddItem={handleAddItem} disabled={isPending} />
          </div>

          {/* Right Column: Billing & Details */}
          <div className="lg:col-span-8 flex flex-col gap-6 h-[1000px] overflow-hidden">
            {/* Scrollable selected items */}
            <div className="flex-1 min-h-0">
              <SelectedItemsList
                control={control}
                register={register}
                errors={errors}
                setValue={setValue}
                disabled={isPending}
              />
            </div>

            {/* Customer Details Form */}
            <div className="bg-background rounded-2xl border border-border/50 p-6 shadow-sm">
              <CustomerDetailsForm
                register={register}
                errors={errors}
                disabled={isPending}
                control={control}
              />
            </div>

            {/* Price Summary & Action */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end shrink-0">
              <InvoiceSummary control={control} setValue={setValue} />

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={isPending}
                  size="lg"
                  className="w-full h-14 text-sm font-bold tracking-widest shadow-lg shadow-primary/10 rounded-xl gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      GENERATE INVOICE
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  };

  return (
    <>
      {renderContent()}
      {/* Hidden PDF template layout */}
      {typeof document !== 'undefined' && createPortal(
        <div 
          id="pdf-render-zone"
          style={{ 
            position: 'fixed', 
            left: '-9999px', 
            top: '0', 
            zIndex: -100,
            background: 'white',
            width: '842px',
            visibility: 'visible'
          }}
        >
          <InvoicePDFTemplate ref={pdfRef} data={pdfSnapshot || watch()} />
        </div>,
        document.body
      )}
    </>
  );
}
