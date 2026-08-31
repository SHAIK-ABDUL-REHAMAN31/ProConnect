import { searchService } from "./search.service.js";
import { ApiResponse } from "../../core/response/apiResponse.js";

export class SearchController {
  async search(req, res, next) {
    try {
      const { q } = req.query;
      const results = await searchService.searchAll(q);
      return ApiResponse.success(res, { results }, "Search results retrieved.");
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
