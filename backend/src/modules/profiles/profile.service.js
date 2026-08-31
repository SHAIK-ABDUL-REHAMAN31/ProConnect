import { profileRepository } from "./profile.repository.js";
import { userRepository } from "../users/user.repository.js";
import { NotFoundError } from "../../core/errors/AppError.js";

export class ProfileService {
  async getProfileByUserId(userId) {
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      // Upsert profile if missing
      return profileRepository.create({ userId });
    }
    return profile;
  }

  async getProfileByUsername(username) {
    const cleanUsername = username.trim().toLowerCase();
    const user = await userRepository.findByUsername(cleanUsername);
    if (!user) {
      throw new NotFoundError(`User @${cleanUsername} was not found.`);
    }

    // Increment profile views
    await profileRepository.incrementViews(user._id);

    const profile = await profileRepository.findByUserId(user._id);
    if (!profile) {
      return {
        userId: user,
        bio: "",
        skills: [],
        pastWork: [],
        education: [],
        projects: [],
      };
    }

    return profile;
  }

  async updateProfile(userId, updateData) {
    const { headline, name, ...profileFields } = updateData;

    // Update user root fields if present
    if (headline !== undefined || name !== undefined) {
      await userRepository.update(userId, {
        ...(headline !== undefined && { headline }),
        ...(name !== undefined && { name }),
      });
    }

    return profileRepository.updateByUserId(userId, profileFields);
  }

  async getAllProfiles(limit = 50, skip = 0) {
    return profileRepository.findAll(limit, skip);
  }
}

export const profileService = new ProfileService();
