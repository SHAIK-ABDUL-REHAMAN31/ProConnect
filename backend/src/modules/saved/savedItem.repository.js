import SavedItem from "./savedItem.model.js";

class SavedItemRepository {
  async create(data) {
    return await SavedItem.create(data);
  }

  async findByUser(userId, filter = {}) {
    return await SavedItem.find({ userId, ...filter }).sort({ createdAt: -1 });
  }

  async findOne(userId, itemType, title) {
    return await SavedItem.findOne({ userId, itemType, title });
  }

  async delete(id, userId) {
    return await SavedItem.findOneAndDelete({ _id: id, userId });
  }

  async getCollections(userId) {
    return await SavedItem.distinct("collectionName", { userId });
  }
}

export default new SavedItemRepository();
