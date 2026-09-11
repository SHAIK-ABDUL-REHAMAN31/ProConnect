import { profileRepository } from "./profile.repository.js";
import { userRepository } from "../users/user.repository.js";
import { NotFoundError } from "../../core/errors/AppError.js";
import { cacheService } from "../../infrastructure/cache/cacheService.js";

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
    const cacheKey = `cache:profile:${cleanUsername}`;

    // 1. Check Redis Cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return { profile: cached.data, fromCache: true };
    }

    const user = await userRepository.findByUsername(cleanUsername);
    if (!user) {
      throw new NotFoundError(`User @${cleanUsername} was not found.`);
    }

    // Increment profile views
    await profileRepository.incrementViews(user._id);

    let profile = await profileRepository.findByUserId(user._id);
    if (!profile) {
      profile = {
        userId: user,
        bio: "",
        skills: [],
        pastWork: [],
        education: [],
        projects: [],
      };
    }

    // 2. Cache-Aside store (5-minute TTL)
    await cacheService.set(cacheKey, profile, 300);

    return { profile, fromCache: false };
  }

  async updateProfile(userId, updateData) {
    const { headline, name, ...profileFields } = updateData;

    // Update user root fields if present
    let updatedUser = null;
    if (headline !== undefined || name !== undefined) {
      updatedUser = await userRepository.update(userId, {
        ...(headline !== undefined && { headline }),
        ...(name !== undefined && { name }),
      });
    }

    const updatedProfile = await profileRepository.updateByUserId(userId, profileFields);

    // Invalidate profile cache
    const user = updatedUser || (await userRepository.findById(userId));
    if (user?.username) {
      await cacheService.del(`cache:profile:${user.username.toLowerCase()}`);
    }
    // Also invalidate feed cache so user's updated headline reflects in feed posts
    await cacheService.delPattern("cache:feed:*");

    return updatedProfile;
  }

  async getAllProfiles(limit = 50, skip = 0) {
    return profileRepository.findAll(limit, skip);
  }
}

export const profileService = new ProfileService();
