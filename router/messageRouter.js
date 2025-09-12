import express from "express";
import { deleteMessage, getAllMessages, sendMessage } from "../controller/messageController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/send", sendMessage);
router.get("/getall", getAllMessages);
router.delete("/delete/:id", isAuthenticated, deleteMessage);
// router.get("/getall", isAuthenticated, getAllMessages);


export default router;
