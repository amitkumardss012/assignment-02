import { useCreateInvoice, useGetInvoiceById, useUpdateInvoice } from "@/api/hooks/invoice.hook";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useInvoiceStore } from "@/store/invoice.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, FileText, Sparkles, Send, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import { InvoicePDFTemplate } from "../../invoice/components/InvoicePDFTemplate";
import { CustomerDetailsForm } from "../../invoice/components/CustomerDetailsForm";
import { InvoiceSummary } from "../../invoice/components/InvoiceSummary";
import { SelectedItemsList } from "../../invoice/components/LineItemsTable";
import { AvailableItemsList } from "../../invoice/components/AvailableItemsList";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { generateInvoiceNumber } from "../../invoice/utils/invoice.utils";
import { invoiceFormSchema, type InvoiceFormValues } from "../../invoice/validators/invoice.validator";

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
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(invoiceFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
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
      status: "pending" as const,
    },
  });

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return;
    
    // Safety check - make sure we have data
    const currentData = watch();
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
          status: fetchedInvoice.status || "pending",
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
          status: "pending",
        });
        setDate(new Date());
      }
    }
  }, [isModalOpen, isEditMode, isViewMode, isCreateMode, fetchedInvoice, reset]);

  const onSubmit = (data: InvoiceFormValues) => {
    if (isViewMode) return;

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

  const handleAddItem = (item: any) => {
    if (isViewMode) return;
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

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-[60vw] w-[60vw] xl:max-w-[1400px] h-[90vh] p-0 flex flex-col gap-0 border-none rounded-[1.8rem] shadow-3xl overflow-hidden bg-background">
        <DialogHeader className="p-0 h-0 w-0 overflow-hidden">


          {/* Hidden but required for accessibility */}
          <DialogTitle>Invoice Modal</DialogTitle>
        </DialogHeader>

        {isFetchingInvoice ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-widest uppercase">Fetching invoice data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col p-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20 p-6 rounded-2xl border border-dashed shadow-sm mb-6 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-bold tracking-tight">
                    {isCreateMode ? "New Transaction" : isEditMode ? "Modify Transaction" : "Transaction Record"}
                  </h3>
                </div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  Invoice: {watch("invoiceNumber") || "Pending..."}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isViewMode && (
                  <Button type="button" variant="outline" size="sm" onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="gap-2 h-11 px-4 rounded-xl font-bold">
                    {isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    Receipt PDF
                  </Button>
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant={"outline"}
                      className={cn(
                        "w-[180px] justify-start text-left font-bold h-11 bg-background shadow-sm rounded-xl border-border/50",
                        !date && "text-muted-foreground"
                      )}
                      disabled={isPending || isViewMode}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                      {date ? format(date, "PPP") : <span>Date</span>}
                    </Button>
                  </PopoverTrigger>
                  {!isViewMode && (
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
                  )}
                </Popover>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              {isViewMode ? (
                /* Independent View Layout */
                <div className="h-full overflow-y-auto no-scrollbar pb-8 flex flex-col gap-8 relative px-1">
                  
                  {/* Customer Information View */}
                  <div className="bg-background rounded-3xl border border-border/40 p-8 shadow-sm shrink-0">
                    <CustomerDetailsForm
                      register={register}
                      errors={errors}
                      disabled={true}
                      control={control}
                      isViewMode={true}
                    />
                  </div>

                  {/* Intersecting Cart Table */}
                  <div className="bg-background border border-border/40 rounded-3xl overflow-hidden shadow-sm shrink-0 flex flex-col">
                    <div className="relative">
                      <SelectedItemsList
                        control={control}
                        register={register}
                        errors={errors}
                        setValue={setValue}
                        disabled={true}
                        isViewMode={true}
                      />
                    </div>
                  </div>

                  {/* Summary Footer */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start shrink-0">
                    <div className="lg:col-span-6 xl:col-span-7 h-full">
                      <div className="bg-muted/10 rounded-3xl p-8 border border-dashed flex flex-col items-center justify-center h-full min-h-[140px] text-center gap-3">
                        <Sparkles className="h-6 w-6 text-primary/40" />
                        <p className="text-sm text-muted-foreground italic font-medium leading-relaxed">
                          Thank you for your business. This is a computer generated invoice.<br />
                          <strong className="font-bold text-foreground/40 mt-1 block">No signature is required.</strong>
                        </p>
                      </div>
                    </div>
                    <div className="lg:col-span-6 xl:col-span-5 w-full min-w-[300px]">
                      <InvoiceSummary control={control} setValue={setValue} />
                    </div>
                  </div>
                  
                  {/* Scroll actions / Bottom fixed */}
                  <div className="flex items-center justify-end gap-4 mt-4 pt-6 border-t border-dashed shrink-0">
                     <Button
                        type="button"
                        variant="outline"
                        onClick={closeModal}
                        className="h-14 px-10 text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-muted/50 transition-colors"
                      >
                        Close
                      </Button>
                      <Button type="button" onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="h-14 px-10 rounded-2xl gap-3 font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                        {isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                        Download Document
                      </Button>
                  </div>
                </div>
              ) : (
                /* Edit/Create POS Layout */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full overflow-hidden">
                  {/* Left Column: Product Selection */}
                  <div className="hidden lg:block lg:col-span-4 h-full overflow-hidden border border-border/40 rounded-3xl bg-background shadow-sm">
                    <AvailableItemsList onAddItem={handleAddItem} disabled={isPending} />
                  </div>

                  {/* Right Column: Billing & Details */}
                  <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
                    {/* Scrollable selected items */}
                    <div className="flex-1 min-h-0 bg-background border border-border/40 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                      <SelectedItemsList
                        control={control}
                        register={register}
                        errors={errors}
                        setValue={setValue}
                        disabled={isPending}
                        isViewMode={false}
                      />
                    </div>

                    {/* Customer Details Form */}
                    <div className="bg-background rounded-3xl border border-border/40 p-6 shadow-sm shrink-0">
                      <CustomerDetailsForm
                        register={register}
                        errors={errors}
                        disabled={isPending}
                        control={control}
                        isViewMode={false}
                      />
                    </div>

                    {/* Price Summary & Action */}
                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-stretch shrink-0">
                      <div className="xl:col-span-3 min-w-[280px]">
                        <InvoiceSummary control={control} setValue={setValue} />
                      </div>

                      <div className="xl:col-span-2 flex flex-col justify-end gap-3 h-full pb-1">
                        <div className="flex flex-col sm:flex-row xl:flex-col gap-4 w-full">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={closeModal}
                            disabled={isPending}
                            className="flex-1 h-14 text-xs font-bold uppercase tracking-widest rounded-2xl border-dashed hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-colors"
                          >
                            Abort
                          </Button>
                          <Button
                            type="submit"
                            disabled={isPending}
                            className="flex-2 h-14 text-sm font-bold tracking-widest shadow-xl shadow-primary/20 rounded-2xl gap-2 w-full transition-all hover:scale-[1.01]"
                          >
                            {isPending ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <>
                                <Send className="h-4 w-4" />
                                {isCreateMode ? "FINALIZE" : "UPDATE RECORD"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        )}
        {/* Hidden PDF template layout - Rendered in portal for cleaner layout calculation */}
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
            <InvoicePDFTemplate ref={pdfRef} data={watch()} />
          </div>,
          document.body
        )}
      </DialogContent>
    </Dialog>
  );
}

