import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    profilePicturePublicId: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;