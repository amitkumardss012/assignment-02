import { asyncHandler } from "../middlewares/error.middleware.js";
import ItemService from "../services/item.service.js";
import { statusCode } from "../types/types.js";
import type { QueryFilter } from "mongoose";
import { ErrorResponse, SuccessResponse } from "../utils/response.js";
import { itemSchema, updateItemSchema } from "../validators/item.validator.js";
import type { IItem } from "../models/item.model.js";

/**
 * @description Controller for creating a new item.
 * @route POST /api/v1/items
 * @returns {Object} Created Item data
 */
export const createItem = asyncHandler(async (req, res, next) => {
    console.log(req.body)
    const { name, description, variants, basePrice } = itemSchema.parse(req.body);

    const item = await ItemService.createItem({
        name,
        description,
        variants,
        basePrice,
    });

    return SuccessResponse(
        res,
        "Item created successfully",
        item,
        statusCode.Created,
    );
});

/**
 * @description Controller for fetching all items with pagination and search.
 * @route GET /api/v1/items
 * @param {page, limit, name} Query parameters
 * @returns {Array<IItem>} Fetched items with pagination data
 */
export const getAllItems = asyncHandler(async (req, res, next) => {
    const { page: pageQuery, limit: limitQuery, name } = req.query;

    const page = Number(pageQuery) || 1;
    const limit = Number(limitQuery) || 10;
    const skip = (page - 1) * limit;

    if (page < 1 || limit < 1)
        return next(
            new ErrorResponse("Invalid page or limit", statusCode.Bad_Request),
        );

    if (limit > 100)
        return next(
            new ErrorResponse(
                "Limit should be less than or equal to 100",
                statusCode.Bad_Request,
            ),
        );

    const query: QueryFilter<IItem> = {};
    if (typeof name === "string") {
  query.name = { $regex: name, $options: "i" };
}

    const { items, totalItems } = await ItemService.getAllItems(
        query,
        skip,
        limit,
    );

    return SuccessResponse(
        res,
        "Items fetched successfully",
        {
            items,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
                count: items.length,
            },
        },
        statusCode.OK,
    );
});

/**
 * @description Controller for fetching a single item by ID.
 * @route GET /api/v1/items/:id
 * @param {string} id - ID of the item to fetch
 * @returns {IItem} Fetched item data
 */
export const getItemById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if(!id) return next(new ErrorResponse("Item ID is required", statusCode.Bad_Request));
    const item = await ItemService.getItemById(id as string);

    if (!item) {
        return next(new ErrorResponse("Item not found", statusCode.Not_Found));
    }

    return SuccessResponse(res, "Item fetched successfully", item, statusCode.OK);
});

/**
 * @description Controller for updating an item by ID.
 * @route PUT /api/v1/items/:id
 * @param {string} id - ID of the item to update
 * @param {UpdateItemType} updateData - Partial item data to update
 * @returns {IItem} Updated item data
 */
export const updateItem = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if(!id) return next(new ErrorResponse("Item ID is required", statusCode.Bad_Request));

    const updateData = updateItemSchema.parse(req.body);

    const itemExists = await ItemService.getItemById(id as string);
    if (!itemExists) {
        return next(new ErrorResponse("Item not found", statusCode.Not_Found));
    }

    const item = await ItemService.updateItem(id as string, updateData);

    return SuccessResponse(res, "Item updated successfully", item, statusCode.OK);
});
