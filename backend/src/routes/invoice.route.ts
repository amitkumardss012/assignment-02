import { Router } from "express";
import {
    createInvoice,
    getAllInvoices,
    getInvoiceById,
    updateInvoice,
} from "../controllers/invoice.controller.js";

const router = Router();

/**
 * @route /api/v1/invoice
 * @desc Base routes for invoices
 */
router.route("/").post(createInvoice).get(getAllInvoices);

/**
 * @route /api/v1/invoice/:id
 * @desc Single invoice routes
 */
router.route("/:id").get(getInvoiceById).put(updateInvoice);

export default router;
