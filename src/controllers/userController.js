import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import User from "../models/userModel.js";
import Link from "../models/linkModel.js";

export const register = async (req, res) => {
  const { username, password, email, instagramId } = req.body;

  try {
    // Check for missing fields
    const requiredFields = { username, password, email, instagramId };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res
          .status(400)
          .json({ success: false, message: `Please fill in the ${key}` });
      }
    }

    // Check for existing user or email
    const [existingUser, existingEmail] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ email }),
    ]);

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Username already exists" });
    }

    if (existingEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create a new User
    const newUser = new User({
      instagramId,
      username,
      password: hashedPassword,
      email,
    });

    // Save the new User
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Error while registering User:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while registering the User",
    });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill username" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill password" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    if (user.isDeleted === true) {
      return res.status(401).json({
        success: false,
        message: "Your account is suspended, please contact the support team.",
      });
    }

    // Log the retrieved password for debugging
    console.log("Retrieved user's password:", user.password);

    // Ensure the user's password is defined
    if (!user.password) {
      console.error("Error: Retrieved user's password is undefined");
      return res.status(500).json({
        message: "Internal Server Error",
        success: false,
      });
    }

    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        id: user._id,
        name: user.name,
        username: user.username,
        token: token,
      },
    });
  } catch (error) {
    console.error("Error while logging in:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.query;
  try {
    const userCheck = await User.findById(id);

    if (!userCheck) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (userCheck.isDeleted) {
      return res.status(400).json({
        success: false,
        message:
          "Account is already suspended, kindly contact the support team",
      });
    }

    await User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    return res.status(200).json({
      success: true,
      message: "Account suspended successfully",
    });
  } catch (error) {
    console.error("Error while deleting User:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Update User
export const updateUser = async (req, res) => {
  try {
    const { id } = req.query;

    const userCheck = await User.findById(id);

    if (!userCheck) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (userCheck.isDeleted) {
      return res.status(400).json({
        success: false,
        message:
          "Account is already suspended, kindly contact the support team",
      });
    }

    const { username, password, email } = req.body;

    // Create an update object dynamically
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) {
      const hashedPassword = await bcryptjs.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "User details updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error while updating User:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

export const socialLogin = async (profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        username: profile.displayName,
        email: profile.email[0].value,
        profilePicture: profile.photos[0].value,
      });
      return done(null, user);
    }
  } catch (error) {
    return done(error, null);
  }
};

// Logout user
export const logoutUser = (req, res) => {
  req.logout();
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const highlightedLink = async (req, res) => {
  try {
    const { id } = req.query;
    const { linkId } = req.body;

    // Fetch user and link by their respective IDs
    const user = await User.findById(id);
    const link = await Link.findById(linkId);

    // Check if the user and link exist
    if (!user || !link) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid user or link" });
    }

    // Check if the link is already present in the user's link array
    const linkExists = user.links.some((userLink) => userLink.equals(linkId));

    if (linkExists) {
      // Remove the link from the user's array if it already exists
      user.links.pull(linkId);
      await user.save();
      return res
        .status(200)
        .json({ success: true, message: "Link removed successfully", link });
    } else {
      // Check if the user's link array has reached its maximum size
      if (user.links.length >= 3) {
        return res.status(400).json({
          success: false,
          message: "Link array is full, cannot add more links",
        });
      }

      // Add the link to the user's array if the array is not full
      user.links.push(linkId);
      await user.save();
      return res
        .status(200)
        .json({ success: true, message: "Link added successfully", link });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getUserByToken = async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY); // Assuming you're using JWT
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Please log in again" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Welcome back!", user });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
