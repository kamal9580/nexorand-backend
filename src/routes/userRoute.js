import express from "express"; // Make sure to use the correct path
import {
  register,
  login,
  deleteUser,
  updateUser,
  getAllUsers,
  highlightedLink,
  getUserByToken,
} from "../controllers/userController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

// Route for user registration
router.post("/register", register);
router.post("/login", login);
router.delete("/delete", verifyToken, deleteUser);
router.put("/update", verifyToken, updateUser);
router.get("/all", verifyToken, getAllUsers);
router.put("/highlight", verifyToken, highlightedLink);
router.get("/user", getUserByToken);

export default router;
