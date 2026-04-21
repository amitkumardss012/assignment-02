import { addDays, format } from 'date-fns';
import { forwardRef } from 'react';
import type { InvoiceFormValues } from '../validators/invoice.validator';

interface InvoicePDFTemplateProps {
  data: InvoiceFormValues;
}

export const InvoicePDFTemplate = forwardRef<HTMLDivElement, InvoicePDFTemplateProps>(
  ({ data }, ref) => {
    const discountedItems = (data.items || []).filter(item => {
      const basePrice = Number(item.basePrice) || 0;
      const quantity = Number(item.quantity) || 0;
      const discountValue = Number(item.discountValue) || 0;
      const discountVal = item.discountType === 'percentage'
        ? (basePrice * quantity * discountValue) / 100
        : discountValue;
      return discountVal > 0;
    });

    const totalSavingsStr = discountedItems.length > 0
      ? `(₹${discountedItems.reduce((acc, item) => {
          const bp = Number(item.basePrice) || 0;
          const qty = Number(item.quantity) || 0;
          const dv = Number(item.discountValue) || 0;
          const saving = item.discountType === 'percentage' ? (bp * qty * dv) / 100 : dv;
          return acc + saving;
        }, 0).toFixed(2)} total savings)`
      : '';

    return (
      <div
        ref={ref}
        className="bg-white text-black p-12 w-[842px] min-h-[1191px] flex flex-col"
        style={{
          fontFamily: 'Helvetica, Arial, sans-serif',
          boxSizing: 'border-box'
        }}
      >
        {/* TOP: Brand Logo */}
        <div className="mb-6 text-center border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Healthy<span className="text-[#8BC34A]">Chef</span>
          </h1>
        </div>

        {/* MIDDLE: Side-by-Side Details */}
        <div className="grid grid-cols-2 gap-12 mb-6">
          {/* Left: Invoice Details */}
          <div>
            <h2 className="font-bold text-[11px] uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">Invoice Details</h2>
            <div className="text-[11px] space-y-1">
              <div className="flex"><span className="text-gray-500 w-24">Invoice Number:</span> <span className="font-bold">{data.invoiceNumber || 'N/A'}</span></div>
              <div className="flex"><span className="text-gray-500 w-24">Invoice Date:</span> <span className="font-bold">{data.date ? format(new Date(data.date), 'MMMM d, yyyy') : 'N/A'}</span></div>
              <div className="flex"><span className="text-gray-500 w-24">Due Date:</span> <span className="font-bold text-red-600">{data.date ? format(addDays(new Date(data.date), 15), 'MMMM d, yyyy') : 'N/A'}</span></div>
            </div>
          </div>

          {/* Right: Customer Details */}
          <div className="text-right">
            <h2 className="font-bold text-[11px] uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">Billed To:</h2>
            <div className="text-[11px] space-y-1 font-medium">
              <p className="font-bold text-gray-900">{data.customerDetails?.fullName || 'N/A'}</p>
              <p>{data.customerDetails?.phoneNumber || 'N/A'}</p>
              <p>{data.customerDetails?.emailId || 'N/A'}</p>
              <p className="leading-relaxed max-w-[200px] ml-auto text-gray-500">{data.customerDetails?.billingAddress || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* TABLE: Line Items */}
        <div className="mb-8">
          <h2 className="font-bold text-[11px] uppercase tracking-wider mb-3">Line Items</h2>
          <table className="w-full border-collapse border border-gray-200 text-[10px] text-left">
            <thead className="bg-[#f8f8f8]">
              <tr>
                <th className="p-3 border border-gray-200 font-bold w-1/4">Item Name</th>
                <th className="p-3 border border-gray-200 font-bold text-center w-12">Qty</th>
                <th className="p-3 border border-gray-200 font-bold text-right w-24">Base Price (₹)</th>
                <th className="p-3 border border-gray-200 font-bold text-right w-16">GST %</th>
                <th className="p-3 border border-gray-200 font-bold text-right w-20">Discount</th>
                <th className="p-3 border border-gray-200 font-bold text-right">Row Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {(data.items || []).map((item, index) => {
                const basePrice = Number(item.basePrice) || 0;
                const quantity = Number(item.quantity) || 0;
                const gstPercentage = Number(item.gstPercentage) || 0;
                const discountValue = Number(item.discountValue) || 0;
                const rowTotal = Number(item.rowTotal) || 0;
                
                return (
                  <tr key={index}>
                    <td className="p-3 border border-gray-200 font-bold text-gray-900">{item.name || 'Unnamed Item'}</td>
                    <td className="p-3 border border-gray-200 text-center">{quantity}</td>
                    <td className="p-3 border border-gray-200 text-right">₹{basePrice.toFixed(2)}</td>
                    <td className="p-3 border border-gray-200 text-right">{gstPercentage}%</td>
                    <td className="p-3 border border-gray-200 text-right">
                      {item.discountType === 'percentage'
                        ? `${discountValue}%`
                        : `₹${discountValue.toFixed(2)}`}
                    </td>
                    <td className="p-3 border border-gray-200 text-right font-black text-gray-900">₹{rowTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* BOTTOM: Side-by-Side Summary & Terms */}
        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-100">
          {/* Left: Terms & Conditions */}
          <div className="pr-4">
            <h2 className="font-bold text-[11px] mb-3 uppercase tracking-wider text-gray-400">Terms & Conditions</h2>
            <div className="text-[9px] text-gray-600 space-y-2 leading-relaxed">
              <p className="flex items-start gap-2 pl-2"><span>1.</span> <span>Payment Terms: Payment is due within 15 days of the invoice date.</span></p>
              <p className="flex items-start gap-2 pl-2"><span>2.</span> <span>Late Fees: A late fee of 2% per month will be applied to overdue balances.</span></p>
              <p className="flex items-start gap-2 pl-2"><span>3.</span> <span>Jurisdiction: All disputes are subject to Bengaluru jurisdiction only.</span></p>
              <p className="flex items-start gap-2 pl-2"><span>4.</span> <span>Thank you for choosing HealthyChef!</span></p>
            </div>
          </div>

          {/* Right: Calculation Summary */}
          <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
            <div className="text-[10px] space-y-2">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal Amount:</span>
                <span className="font-bold text-gray-900">₹{(data.totals?.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax Collected:</span>
                <span className="font-bold text-gray-900">₹{(data.totals?.totalGst || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-red-500 font-medium">
                <div className="flex flex-col items-start">
                  <span>Discount:</span>
                  {totalSavingsStr && <span className="text-[8px] opacity-70 italic">{totalSavingsStr}</span>}
                </div>
                <span className="font-bold">- ₹{(data.totals?.totalDiscount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-3 mt-2 border-t border-gray-200 flex justify-between items-baseline">
                <span className="font-black text-[10px] uppercase tracking-tighter text-gray-400">Grand Total</span>
                <span className="text-xl font-black text-gray-900">₹{(data.totals?.grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

InvoicePDFTemplate.displayName = 'InvoicePDFTemplate';
