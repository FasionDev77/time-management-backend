import express from 'express';
import {
  createRecord,
  updateRecord,
  deleteRecord,
  filterRecords,
} from '../controllers/record.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(authenticate);

router.post('/', createRecord);
router.put('/:id', updateRecord);
router.delete('/:id', deleteRecord);
router.get('/', filterRecords);

export default router;