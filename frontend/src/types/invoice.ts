import  { type IItem } from "./item";

export interface ILineItem {
  itemId: string | IItem; // string in payload, populated IItem in response
  quantity: number;
  gstPercentage: number;
  discountType: "percentage" | "amount";
  discountValue: number;
  rowTotal: number;
}

export interface ICustomerDetails {
  fullName: string;
  phoneNumber: string;
  emailId: string;
  billingAddress: string;
}

export interface ITotals {
  subtotal: number;
  totalDiscount: number;
  totalGst: number;
  grandTotal: number;
}

export type InvoiceStatus = "pending" | "paid" | "overdue";

export interface IInvoice {
  _id: string;
  invoiceNumber: string;
  customerDetails: ICustomerDetails;
  items: ILineItem[];
  totals: ITotals;
  status: InvoiceStatus;
  date?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IInvoicePayload {
  invoiceNumber: string;
  customerDetails: ICustomerDetails;
  items: Omit<ILineItem, "rowTotal">[]; // FE usually sends without rowTotal if BE calculates, OR they send it. 
  // Given user's request "trust whatever frontend is sending", FE sends everything.
  totals: ITotals;
  status: InvoiceStatus;
  date?: string;
}

export interface IUpdateInvoicePayload extends Partial<IInvoicePayload> {}

export interface IInvoiceQueryParams {
  page?: number;
  limit?: number;
  customerName?: string;
  customerPhone?: string;
  invoiceNumber?: string;
  search?: string;
}

export interface IPagination {
  totalInvoices: number;
  totalPages: number;
  currentPage: number;
  count: number;
}

export interface IInvoicesResponse {
  invoices: IInvoice[];
  pagination: IPagination;
}
