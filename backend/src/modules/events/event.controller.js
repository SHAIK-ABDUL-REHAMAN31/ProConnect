import eventService from "./event.service.js";
import ApiResponse from "../../core/response/apiResponse.js";

class EventController {
  async create(req, res, next) {
    try {
      const event = await eventService.createEvent(req.user.id, req.body);
      return ApiResponse.created(res, "Event created successfully", event);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const events = await eventService.getAllEvents(req.query);
      return ApiResponse.success(res, "Events retrieved successfully", events);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const event = await eventService.getEventById(req.params.id);
      return ApiResponse.success(res, "Event details retrieved successfully", event);
    } catch (error) {
      next(error);
    }
  }

  async toggleRsvp(req, res, next) {
    try {
      const result = await eventService.toggleRsvp(req.params.id, req.user.id);
      return ApiResponse.success(
        res,
        result.isAttending ? "RSVP confirmed" : "RSVP cancelled",
        result
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new EventController();
