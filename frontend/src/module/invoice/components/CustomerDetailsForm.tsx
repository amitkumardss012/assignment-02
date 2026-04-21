import { type UseFormRegister, type FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { InvoiceFormValues } from "../validators/invoice.validator";
import { User, Mail, Phone, MapPin, Contact2 } from "lucide-react";
import { useWatch } from "react-hook-form";

interface CustomerDetailsFormProps {
  register: UseFormRegister<InvoiceFormValues>;
  errors: FieldErrors<InvoiceFormValues>;
  disabled?: boolean;
  isViewMode?: boolean;
  control?: any;
}

export function CustomerDetailsForm({ register, errors, disabled, isViewMode, control }: CustomerDetailsFormProps) {
  const customerDetails = useWatch({
    control,
    name: "customerDetails",
  });

  const InputWrapper = ({ label, icon: Icon, id, error, children }: any) => (
    <div className="grid gap-1.5 flex-1">
      <div className="flex items-center gap-2 px-0.5">
        <Icon className="h-3 w-3 text-primary/70" />
        <Label htmlFor={id} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </Label>
      </div>
      {children}
      {error && (
        <span className="text-[10px] font-bold text-destructive uppercase tracking-tight animate-in fade-in slide-in-from-top-1">
          {error.message}
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-primary/10 p-1.5 rounded-lg">
          <Contact2 className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold tracking-tight">Customer Information</h3>
          <p className="text-[10px] text-muted-foreground">Details for billing and contact</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Full Name */}
        <InputWrapper label="Full Name" icon={User} id="cust-name" error={errors.customerDetails?.fullName}>
          {isViewMode ? (
            <div className="h-9 flex items-center px-3 bg-muted/30 rounded-lg text-sm font-medium border border-transparent">
              {customerDetails?.fullName || "-"}
            </div>
          ) : (
            <Input
              id="cust-name"
              {...register("customerDetails.fullName")}
              disabled={disabled}
              placeholder="e.g. John Doe"
              className="h-9 bg-muted/20 border-border/50 focus-visible:ring-1 focus-visible:ring-primary rounded-lg text-sm"
            />
          )}
        </InputWrapper>

        {/* Email */}
        <InputWrapper label="Email ID" icon={Mail} id="cust-email" error={errors.customerDetails?.emailId}>
          {isViewMode ? (
            <div className="h-9 flex items-center px-3 bg-muted/30 rounded-lg text-sm font-medium border border-transparent">
              {customerDetails?.emailId || "-"}
            </div>
          ) : (
            <Input
              id="cust-email"
              type="email"
              {...register("customerDetails.emailId")}
              disabled={disabled}
              placeholder="name@email.com"
              className="h-9 bg-muted/20 border-border/50 focus-visible:ring-1 focus-visible:ring-primary rounded-lg text-sm"
            />
          )}
        </InputWrapper>

        {/* Phone */}
        <InputWrapper label="Phone Number" icon={Phone} id="cust-phone" error={errors.customerDetails?.phoneNumber}>
          {isViewMode ? (
            <div className="h-9 flex items-center px-3 bg-muted/30 rounded-lg text-sm font-medium border border-transparent">
              {customerDetails?.phoneNumber || "-"}
            </div>
          ) : (
            <Input
              id="cust-phone"
              {...register("customerDetails.phoneNumber")}
              disabled={disabled}
              placeholder="+91 XXXXX XXXXX"
              className="h-9 bg-muted/20 border-border/50 focus-visible:ring-1 focus-visible:ring-primary rounded-lg text-sm"
            />
          )}
        </InputWrapper>

        {/* Address */}
        <div className="md:col-span-3">
          <InputWrapper label="Billing Address" icon={MapPin} id="cust-address" error={errors.customerDetails?.billingAddress}>
            {isViewMode ? (
              <div className="min-h-[60px] p-3 bg-muted/30 rounded-lg text-sm font-medium whitespace-pre-wrap border border-transparent">
                {customerDetails?.billingAddress || "-"}
              </div>
            ) : (
              <Textarea
                id="cust-address"
                {...register("customerDetails.billingAddress")}
                disabled={disabled}
                placeholder="Street address, City, State, ZIP..."
                className="resize-none h-[60px] bg-muted/20 border-border/50 focus-visible:ring-1 focus-visible:ring-primary rounded-lg text-sm"
              />
            )}
          </InputWrapper>
        </div>
      </div>
    </div>
  );
}

