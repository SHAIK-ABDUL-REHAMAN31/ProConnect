import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  username: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  token: {
    type: String,
    default: "",
  },

  active: {
    type: Boolean,
    default: true,
  },
  profilePicture: {
    type: String,
    default: "default.jpg",
  },
});

const User = mongoose.model("User", UserSchema);
export default User;
