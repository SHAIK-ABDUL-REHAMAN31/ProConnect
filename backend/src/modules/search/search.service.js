import User from "../users/user.model.js";
import Post from "../posts/post.model.js";
import Job from "../jobs/job.model.js";
import { escapeRegex } from "../../core/utils/regex.util.js";

export class SearchService {
  async searchAll(keyword) {
    if (!keyword || !keyword.trim()) {
      return { people: [], posts: [], jobs: [] };
    }

    const safeKeyword = escapeRegex(keyword.trim());
    const regex = new RegExp(safeKeyword, "i");

    const [people, posts, jobs] = await Promise.all([
      User.find({
        $or: [{ name: regex }, { username: regex }, { headline: regex }],
      })
        .select("name username headline profilePicture role")
        .limit(10),

      Post.find({ body: regex })
        .populate("userId", "name username profilePicture headline")
        .sort({ createdAt: -1 })
        .limit(10),

      Job.find({
        $or: [{ title: regex }, { companyName: regex }, { description: regex }],
      })
        .populate("recruiterId", "name username")
        .limit(10),
    ]);

    return {
      people,
      posts,
      jobs,
      totalCount: people.length + posts.length + jobs.length,
    };
  }
}

export const searchService = new SearchService();
