import Post from "./post.model.js";

export class PostRepository {
  async findById(id) {
    return Post.findById(id)
      .populate("userId", "name username email profilePicture headline")
      .exec();
  }

  async create(postData) {
    const post = new Post(postData);
    return post.save();
  }

  async findAll(limit = 50, skip = 0) {
    return Post.find({ active: true })
      .populate("userId", "name username email profilePicture headline")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async deleteById(id) {
    return Post.findByIdAndDelete(id).exec();
  }

  async incrementLikes(id, amount = 1) {
    return Post.findByIdAndUpdate(
      id,
      { $inc: { likesCount: amount } },
      { new: true }
    ).exec();
  }

  async incrementComments(id, amount = 1) {
    return Post.findByIdAndUpdate(
      id,
      { $inc: { commentsCount: amount } },
      { new: true }
    ).exec();
  }
}

export const postRepository = new PostRepository();
