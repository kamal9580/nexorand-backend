import Link from "../models/linkModel.js";
import User from "../models/userModel.js";

export const createLink = async (req, res) => {
  const { title, link, image, thumbnail } = req.body;
  if (!title || !link) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }
  const { id } = req.query;
  try {
    const user = await User.findById(id);
    console.log(user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create a new Link
    const newLink = new Link({
      userId: id,
      title,
      link,
      image,
      thumbnail,
    });

    const savedLink = await newLink.save();

    return res.status(201).json({
      success: true,
      data: savedLink,
      message: "Link created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateLink = async (req, res) => {
  const { id } = req.query;
  const { title, link, image, thumbnail } = req.body;

  try {
    const updatedLink = await Link.findByIdAndUpdate(
      id,
      { title, link, image, thumbnail },
      { new: true }
    );

    if (!updatedLink) {
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedLink,
      message: "Link updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const deleteLink = async (req, res) => {
  const { id } = req.query;

  try {
    const deletedLink = await Link.findByIdAndDelete(id);

    if (!deletedLink) {
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }

    // Remove the link from User's links array
    await User.findByIdAndUpdate(
      deletedLink.userId,
      { $pull: { links: deletedLink._id } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Link deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getLinkById = async (req, res) => {
  const { id } = req.query;

  try {
    const link = await Link.findById(id).populate(
      "userId",
      "username email"
    );

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: link,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getAllLinks = async (req, res) => {
	const { id } = req.query; // Extract userId from query parameter
  
	try {
	  if (!id) {
		return res.status(400).json({
		  success: false,
		  message: "User ID is required",
		});
	  }
  
	  // Find the user by ID
	  const user = await User.findById(id);
	  if (!user) {
		return res.status(404).json({
		  success: false,
		  message: "User not found",
		});
	  }
  
	  // Fetch all links associated with the user
	  const links = await Link.find({ userId: id }).sort({ createdAt: -1 }); // Optional: sort by creation date
  
	  return res.status(200).json({
		success: true,
		data: links,
	  });
	} catch (error) {
	  console.error("Error while fetching links:", error);
	  return res.status(500).json({
		success: false,
		message: "Internal Server Error",
		error: error.message,
	  });
	}
};