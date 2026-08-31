import savedItemService from "./savedItem.service.js";
import ApiResponse from "../../core/response/apiResponse.js";

class SavedItemController {
  async create(req, res, next) {
    try {
      const item = await savedItemService.saveItem(req.user.id, req.body);
      return ApiResponse.created(res, "Item bookmarked successfully", item);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const data = await savedItemService.getSavedItems(req.user.id, req.query);
      return ApiResponse.success(res, "Saved items retrieved", data);
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      const result = await savedItemService.removeSavedItem(req.params.id, req.user.id);
      return ApiResponse.success(res, "Bookmark removed", result);
    } catch (error) {
      next(error);
    }
  }
}

export default new SavedItemController();
