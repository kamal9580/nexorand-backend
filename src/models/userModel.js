import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // Ensures no two users have the same username
    },
    password: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensures no two users have the same email
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows for either a Google ID or a Facebook ID or Instagram ID
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    instagramId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
    },
    bio: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    links: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Link', // References the Link model
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export default User;
