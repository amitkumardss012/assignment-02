import type { QueryFilter } from "mongoose";
import Item, { type IItem } from "../models/item.model.js"
import type { ItemType, UpdateItemType } from "../validators/item.validator.js"

/**
 * @class ItemService
 */
class ItemService {
    /**
     * @description Creates a new item in the database.
     * @param {ItemType} itemData - The data for the new item.
     * @returns {Promise<IItem>} The created item document.
     */
    public static async createItem(itemData: ItemType) {
        const item = await Item.create(itemData)
        return item
    }

    /**
     * @description Fetches all items matching the query with pagination.
     * @param {QueryFilter<IItem>} query - The filter criteria.
     * @param {number} skip - Number of documents to skip.
     * @param {number} limit - Maximum number of documents to return.
     * @returns {Promise<{ items: IItem[], totalItems: number }>} An object containing the items and total count.
     */
    public static async getAllItems(query: QueryFilter<IItem>, skip: number, limit: number) {
        const [items, totalItems] = await Promise.all([
            Item.find(query).skip(skip).limit(limit),
            Item.countDocuments(query),
        ]);
        return { items, totalItems };
    }

    /**
     * @description Fetches a single item by its unique ID.
     * @param {string} id - The ID of the item to fetch.
     * @returns {Promise<IItem | null>} The item document or null if not found.
     */
    public static async getItemById(id: string) {
        return await Item.findById(id);
    }

    /**
     * @description Updates an existing item by its ID.
     * @param {string} id - The ID of the item to update.
     * @param {UpdateItemType} updateData - The partial item data to update.
     * @returns {Promise<IItem | null>} The updated item document or null if not found.
     */
    public static async updateItem(id: string, updateData: UpdateItemType) {
        return await Item.findByIdAndUpdate(id, updateData, { new: true });
    }
}

export default ItemService
