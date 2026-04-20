import type { QueryFilter } from "mongoose";
import Invoice, { type IInvoice } from "../models/invoice.model.js";
import type { InvoiceInput, UpdateInvoiceType } from "../validators/invoice.validator.js";

/**
 * @class InvoiceService
 * @description Provides services for managing Invoice data.
 */
class InvoiceService {
    /**
     * @description Creates a new invoice.
     * @param {InvoiceInput} invoiceData - The data for the new invoice.
     * @returns {Promise<IInvoice>} The created invoice.
     */
    public static async createInvoice(invoiceData: InvoiceInput): Promise<IInvoice> {
        return await Invoice.create(invoiceData);
    }

    /**
     * @description Fetches all invoices with pagination.
     * @param {QueryFilter<IInvoice>} query - Filter criteria.
     * @param {number} skip - Number of docs to skip.
     * @param {number} limit - Max docs to return.
     * @returns {Promise<{ invoices: IInvoice[], totalInvoices: number }>}
     */
    public static async getAllInvoices(query: QueryFilter<IInvoice>, skip: number, limit: number): Promise<{ invoices: IInvoice[]; totalInvoices: number; }> {
        const [invoices, totalInvoices] = await Promise.all([
            Invoice.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Invoice.countDocuments(query),
        ]);
        return { invoices: invoices as IInvoice[], totalInvoices };
    }

    /**
     * @description Fetches a single invoice by ID.
     * @param {string} id - Invoice ID.
     * @returns {Promise<IInvoice | null>}
     */
    public static async getInvoiceById(id: string): Promise<IInvoice | null> {
        return await Invoice.findById(id).populate("items.itemId").lean() as IInvoice | null;
    }

    /**
     * @description Updates an existing invoice.
     * @param {string} id - Invoice ID.
     * @param {UpdateInvoiceType} updateData - Data to update.
     * @returns {Promise<IInvoice | null>}
     */
    public static async updateInvoice(id: string, updateData: UpdateInvoiceType): Promise<IInvoice | null> {
        return await Invoice.findByIdAndUpdate(id, updateData, { new: true });
    }
}

export default InvoiceService;
