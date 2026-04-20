import { asyncHandler } from "../middlewares/error.middleware.js";
import type { IInvoice } from "../models/invoice.model.js";
import InvoiceService from "../services/invoice.service.js";
import { statusCode } from "../types/types.js";
import { ErrorResponse, SuccessResponse } from "../utils/response.js";
import { invoiceSchema, updateInvoiceSchema } from "../validators/invoice.validator.js";
import mongoose from "mongoose";

/**
 * @description Controller for creating a new invoice.
 * @route POST /api/v1/invoice
 * @returns {IInvoice} Created invoice data
 */
export const createInvoice = asyncHandler(async (req, res, next) => {
    const invoiceData = invoiceSchema.parse(req.body);

    const invoice = await InvoiceService.createInvoice(invoiceData);

    return SuccessResponse(
        res,
        "Invoice created successfully",
        invoice,
        statusCode.Created
    );
});

/**
 * @description Controller for fetching all invoices with pagination.
 * @route GET /api/v1/invoice
 * @queryParam {number} page - Page number (default: 1)
 * @queryParam {number} limit - Number of invoices per page (default: 10)
 * @queryParam {string} customerName - Customer name filter
 * @queryParam {string} customerPhone - Customer phone filter
 * @queryParam {string} invoiceNumber - Invoice number filter
 * @returns {Array<IInvoice>} List of invoices with pagination data
 */
export const getAllInvoices = asyncHandler(async (req, res, next) => {
    const { page: pageQuery, limit: limitQuery, customerName, customerPhone, invoiceNumber } = req.query;

    const page = Number(pageQuery) || 1;
    const limit = Number(limitQuery) || 10;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (typeof customerName === "string") {
        query["customerDetails.fullName"] = { $regex: customerName, $options: "i" };
    }
    if (typeof invoiceNumber === "string") {
        query.invoiceNumber = { $regex: invoiceNumber, $options: "i" };
    }

    if (typeof customerPhone === "string") {
        query["customerDetails.phoneNumber"] = { $regex: customerPhone, $options: "i" };
    }

    const { invoices, totalInvoices } = await InvoiceService.getAllInvoices(query, skip, limit);

    return SuccessResponse(
        res,
        "Invoices fetched successfully",
        {
            invoices,
            pagination: {
                totalInvoices,
                totalPages: Math.ceil(totalInvoices / limit),
                currentPage: page,
                count: invoices.length,
            },
        },
        statusCode.OK
    );
});

/**
 * @description Controller for fetching a single invoice by ID.
 * @route GET /api/v1/invoice/:id
 * @returns {IInvoice} Fetched invoice data
 */
export const getInvoiceById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new ErrorResponse("Invoice ID is required", statusCode.Bad_Request));
    }

    const invoice = await InvoiceService.getInvoiceById(id as string);

    return SuccessResponse(res, "Invoice fetched successfully", invoice, statusCode.OK);
});

/**
 * @description Controller for updating an invoice.
 * @route PUT /api/v1/invoice/:id
 * @returns {IInvoice} Updated invoice data
 */
export const updateInvoice = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new ErrorResponse("Invoice ID is required", statusCode.Bad_Request));
    }

    const updateData = updateInvoiceSchema.parse(req.body);

    const invoice = await InvoiceService.updateInvoice(id as string, updateData);

    if (!invoice) {
        return next(new ErrorResponse("Invoice not found", statusCode.Not_Found));
    }

    return SuccessResponse(res, "Invoice updated successfully", invoice, statusCode.OK);
});
