import express from "express";
import {
  createRecord,
  updateRecord,
  deleteRecord,
  filterRecords,
  userRecords,
  deleteUserRecord,
  exportRecords,
  allRecords,
  adminCreateRecord,
} from "../controllers/record.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(authenticate);

router.post("/", createRecord);
router.post("/admin-record-create/:userEmail", adminCreateRecord);
router.put("/:id", updateRecord);
router.delete("/:id", deleteRecord);
router.delete("/userRecord/:id", deleteUserRecord);
router.get("/all-records", allRecords);
router.get("/filter", filterRecords);
router.get("/user/:userId", userRecords);
router.get("/export/:userId", exportRecords);

export default router;
