import express from "express";
import {
  createRecord,
  updateRecord,
  deleteRecord,
  filterRecords,
  userRecords,
  deleteUserRecord,
} from "../controllers/record.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(authenticate);

router.post("/", createRecord);
router.put("/:id", updateRecord);
router.delete("/:id", deleteRecord);
router.delete("/userRecord/:id", deleteUserRecord);
router.get("/filter", filterRecords);
router.get("/user/:userId", userRecords);

export default router;
