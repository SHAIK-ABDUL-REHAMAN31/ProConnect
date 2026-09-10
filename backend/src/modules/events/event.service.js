import eventRepository from "./event.repository.js";
import { NotFoundError } from "../../core/errors/AppError.js";
import { escapeRegex } from "../../core/utils/regex.util.js";

class EventService {
  async createEvent(userId, payload) {
    return await eventRepository.create({
      ...payload,
      hostUserId: userId,
      attendees: [userId],
    });
  }

  async getAllEvents(query = {}) {
    const filter = {};
    if (query.category && query.category !== "All") {
      filter.category = query.category;
    }
    if (query.eventType && query.eventType !== "All") {
      filter.eventType = query.eventType;
    }
    if (query.search) {
      const safeSearch = escapeRegex(query.search.trim());
      const searchRegex = new RegExp(safeSearch, "i");
      filter.$or = [
        { title: { $regex: searchRegex } },
        { speakerName: { $regex: searchRegex } },
        { tags: { $in: [searchRegex] } },
      ];
    }
    return await eventRepository.findAll(filter);
  }

  async getEventById(id) {
    const event = await eventRepository.findById(id);
    if (!event) {
      throw new NotFoundError("Event not found");
    }
    return event;
  }

  async toggleRsvp(eventId, userId) {
    const result = await eventRepository.toggleRsvp(eventId, userId);
    if (!result) {
      throw new NotFoundError("Event not found");
    }
    return result;
  }
}

export default new EventService();
