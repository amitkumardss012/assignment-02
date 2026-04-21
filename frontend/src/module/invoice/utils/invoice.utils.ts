export interface ICalculationRow {
  basePrice: number;
  quantity: number;
  gstPercentage: number;
  discountType: "percentage" | "amount";
  discountValue: number;
}

const roundToTwo = (num: any) => {
  if (isNaN(num) || num === null || num === undefined) return 0;
  return +(Math.round(Number(num + "e+2")) + "e-2");
};

export const calculateRowTotal = (row: ICalculationRow) => {
  const basePrice = Number(row.basePrice) || 0;
  const quantity = Number(row.quantity) || 0;
  const gstPercentage = Number(row.gstPercentage) || 0;
  const discountValue = Number(row.discountValue) || 0;
  const discountType = row.discountType || "percentage";
  
  const subtotal = roundToTwo(basePrice * quantity);
  
  let discountAmount = 0;
  if (discountType === "percentage") {
    discountAmount = roundToTwo((subtotal * discountValue) / 100);
  } else {
    discountAmount = roundToTwo(discountValue);
  }
  
  const priceAfterDiscount = roundToTwo(subtotal - discountAmount);
  const gstAmount = roundToTwo((priceAfterDiscount * gstPercentage) / 100);
  
  const rowTotal = roundToTwo(priceAfterDiscount + gstAmount);
  
  return {
    subtotal,
    discountAmount,
    gstAmount,
    rowTotal
  };
};

export const calculateInvoiceTotals = (rows: ICalculationRow[]) => {
  const totals = rows.reduce(
    (acc, row) => {
      const { subtotal, discountAmount, gstAmount, rowTotal } = calculateRowTotal(row);
      return {
        subtotal: acc.subtotal + subtotal,
        totalDiscount: acc.totalDiscount + discountAmount,
        totalGst: acc.totalGst + gstAmount,
        grandTotal: acc.grandTotal + rowTotal,
      };
    },
    { subtotal: 0, totalDiscount: 0, totalGst: 0, grandTotal: 0 }
  );

  return {
    subtotal: roundToTwo(totals.subtotal),
    totalDiscount: roundToTwo(totals.totalDiscount),
    totalGst: roundToTwo(totals.totalGst),
    grandTotal: roundToTwo(totals.grandTotal),
  };
};

export const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}-${random}`;
};
