import express from "express";
import {
  createLink,
  deleteLink,
  getAllLinks,
  getLinkById,
  updateLink,
} from "../controllers/linkController.js";

const router = express.Router();

router.post("/create", createLink);
router.put("/update", updateLink);
router.delete("/delete", deleteLink);
router.get("/fetch/single", getLinkById);
router.get("/fetch/all", getAllLinks);

export default router;
