import { type UseFormRegister, type FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { InvoiceFormValues } from "../validators/invoice.validator";

interface CustomerDetailsFormProps {
  register: UseFormRegister<InvoiceFormValues>; 
  errors: FieldErrors<InvoiceFormValues>;
  disabled?: boolean;
}

export function CustomerDetailsForm({ register, errors, disabled }: CustomerDetailsFormProps) {
  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-6 w-1 bg-primary rounded-full"></div>
        <h3 className="text-sm font-bold uppercase tracking-wider">Customer Information</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="grid gap-2">
          <Label htmlFor="cust-name">Full Name</Label>
          <Input
            id="cust-name"
            {...register("customerDetails.fullName")}
            disabled={disabled}
            placeholder="John Doe"
          />
          {errors.customerDetails?.fullName && (
            <span className="text-[10px] uppercase font-bold text-destructive">{errors.customerDetails.fullName.message}</span>
          )}
        </div>

        {/* Email */}
        <div className="grid gap-2">
          <Label htmlFor="cust-email">Email Address</Label>
          <Input
            id="cust-email"
            type="email"
            {...register("customerDetails.emailId")}
            disabled={disabled}
            placeholder="john@example.com"
          />
          {errors.customerDetails?.emailId && (
            <span className="text-[10px] uppercase font-bold text-destructive">{errors.customerDetails.emailId.message}</span>
          )}
        </div>

        {/* Phone */}
        <div className="grid gap-2">
          <Label htmlFor="cust-phone">Phone Number</Label>
          <Input
            id="cust-phone"
            {...register("customerDetails.phoneNumber")}
            disabled={disabled}
            placeholder="+91-1234567890"
          />
          {errors.customerDetails?.phoneNumber && (
            <span className="text-[10px] uppercase font-bold text-destructive">{errors.customerDetails.phoneNumber.message}</span>
          )}
        </div>

        {/* Address */}
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="cust-address">Billing Address</Label>
          <Textarea
            id="cust-address"
            {...register("customerDetails.billingAddress")}
            disabled={disabled}
            placeholder="Enter full billing address..."
            className="resize-none h-20"
          />
          {errors.customerDetails?.billingAddress && (
            <span className="text-[10px] uppercase font-bold text-destructive">{errors.customerDetails.billingAddress.message}</span>
          )}
        </div>
      </div>
    </div>
  );
}
