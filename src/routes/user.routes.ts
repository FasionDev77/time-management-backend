import express from 'express';
import {
  getAllUsers,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeAdminOrManager } from '../middlewares/auth.middleware';

const router = express.Router();

// Admin and User Manager can fetch all users
router.get('/', authenticate, authorizeAdminOrManager, getAllUsers);
router.put('/:id', authenticate, authorizeAdminOrManager, updateUser);
router.delete('/:id', authenticate, authorizeAdminOrManager, deleteUser);

export default router;