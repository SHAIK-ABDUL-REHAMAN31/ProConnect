import Event from "./event.model.js";

class EventRepository {
  async create(eventData) {
    return await Event.create(eventData);
  }

  async findAll(filter = {}, limit = 50, skip = 0) {
    return await Event.find(filter)
      .populate("hostUserId", "name email username profilePicture headline")
      .populate("attendees", "name email username profilePicture")
      .sort({ eventDate: 1 })
      .skip(skip)
      .limit(limit);
  }

  async findById(id) {
    return await Event.findById(id)
      .populate("hostUserId", "name email username profilePicture headline")
      .populate("attendees", "name email username profilePicture");
  }

  async toggleRsvp(eventId, userId) {
    const event = await Event.findById(eventId);
    if (!event) return null;

    const attendeeIndex = event.attendees.findIndex(
      (a) => a.toString() === userId.toString()
    );

    let isAttending = false;
    if (attendeeIndex > -1) {
      event.attendees.splice(attendeeIndex, 1);
      isAttending = false;
    } else {
      event.attendees.push(userId);
      isAttending = true;
    }

    await event.save();
    return { event, isAttending, attendeeCount: event.attendees.length };
  }

  async delete(id) {
    return await Event.findByIdAndDelete(id);
  }
}

export default new EventRepository();
