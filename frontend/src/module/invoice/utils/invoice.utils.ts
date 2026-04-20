export interface ICalculationRow {
  basePrice: number;
  quantity: number;
  gstPercentage: number;
  discountType: "percentage" | "amount";
  discountValue: number;
}

export const calculateRowTotal = (row: ICalculationRow) => {
  const { basePrice, quantity, gstPercentage, discountType, discountValue } = row;
  
  const subtotal = basePrice * quantity;
  
  let discountAmount = 0;
  if (discountType === "percentage") {
    discountAmount = (subtotal * discountValue) / 100;
  } else {
    discountAmount = discountValue;
  }
  
  const priceAfterDiscount = subtotal - discountAmount;
  const gstAmount = (priceAfterDiscount * gstPercentage) / 100;
  
  const rowTotal = priceAfterDiscount + gstAmount;
  
  return {
    subtotal,
    discountAmount,
    gstAmount,
    rowTotal
  };
};

export const calculateInvoiceTotals = (rows: ICalculationRow[]) => {
  return rows.reduce(
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
};

export const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}-${random}`;
};
