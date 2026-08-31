import savedItemRepository from "./savedItem.repository.js";
import { NotFoundError } from "../../core/errors/AppError.js";

class SavedItemService {
  async saveItem(userId, payload) {
    return await savedItemRepository.create({
      ...payload,
      userId,
    });
  }

  async getSavedItems(userId, query = {}) {
    const filter = {};
    if (query.itemType && query.itemType !== "ALL") {
      filter.itemType = query.itemType;
    }
    if (query.collection && query.collection !== "All") {
      filter.collectionName = query.collection;
    }
    const items = await savedItemRepository.findByUser(userId, filter);
    const collections = await savedItemRepository.getCollections(userId);
    return { items, collections };
  }

  async removeSavedItem(id, userId) {
    const deleted = await savedItemRepository.delete(id, userId);
    if (!deleted) {
      throw new NotFoundError("Saved item not found");
    }
    return deleted;
  }
}

export default new SavedItemService();
