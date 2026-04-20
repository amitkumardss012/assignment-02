import { Router } from "express";
import {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
} from "../controllers/item.controller.js";

const router = Router();

/**
 * @route /api/v1/items
 * @desc Base routes for items (Creation and fetch all items with pagination)
 */
router.route("/").post(createItem).get(getAllItems);

/**
 * @route /api/v1/items/:id
 * @desc Single item routes (Fetching by ID and Update)
 */
router.route("/:id").get(getItemById).put(updateItem);

export default router;
