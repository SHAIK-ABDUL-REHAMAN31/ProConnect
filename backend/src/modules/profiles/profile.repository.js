import Profile from "./profile.model.js";

export class ProfileRepository {
  async findByUserId(userId) {
    return Profile.findOne({ userId })
      .populate("userId", "name username email profilePicture headline bannerImage role")
      .exec();
  }

  async create(profileData) {
    const profile = new Profile(profileData);
    return profile.save();
  }

  async updateByUserId(userId, updateData) {
    return Profile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    )
      .populate("userId", "name username email profilePicture headline bannerImage role")
      .exec();
  }

  async incrementViews(userId) {
    return Profile.findOneAndUpdate({ userId }, { $inc: { profileViewsCount: 1 } }).exec();
  }

  async findAll(limit = 50, skip = 0) {
    return Profile.find()
      .populate("userId", "name username email profilePicture headline")
      .limit(limit)
      .skip(skip)
      .sort({ updatedAt: -1 })
      .exec();
  }
}

export const profileRepository = new ProfileRepository();
