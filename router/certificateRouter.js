import express from "express";
import {
  addNewCertificate,
  updateCertificate,
  deleteCertificate,
  getAllCertificates,
  getSingleCertificate,
} from "../controller/certificateController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/add", isAuthenticated, addNewCertificate);
router.put("/update/:id", isAuthenticated, updateCertificate);
router.delete("/delete/:id", isAuthenticated, deleteCertificate);
router.get("/getall", getAllCertificates);
router.get("/get/:id", getSingleCertificate);

export default router;
