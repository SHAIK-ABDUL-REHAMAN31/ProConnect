import User from "./user.model.js";

export class UserRepository {
  async findById(id, selectPassword = false) {
    const query = User.findById(id);
    if (selectPassword) query.select("+password");
    return query.exec();
  }

  async findByEmail(email, selectPassword = false) {
    const query = User.findOne({ email: email.toLowerCase().trim() });
    if (selectPassword) query.select("+password");
    return query.exec();
  }

  async findByIdentifier(identifier, selectPassword = false) {
    const clean = identifier.trim();
    const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const query = User.findOne({
      $or: [
        { email: clean.toLowerCase() },
        { username: { $regex: new RegExp(`^${escaped}$`, "i") } },
      ],
    });
    if (selectPassword) query.select("+password");
    return query.exec();
  }

  async findByUsername(username) {
    return User.findOne({ username: username.toLowerCase().trim() }).exec();
  }

  async findByToken(token) {
    return User.findOne({ token }).exec();
  }

  async create(userData) {
    const user = new User(userData);
    return user.save();
  }

  async update(id, updateData) {
    return User.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async findAll(query = {}, limit = 50, skip = 0) {
    return User.find(query)
      .select("name username email headline profilePicture role createdAt")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .exec();
  }
}

export const userRepository = new UserRepository();
