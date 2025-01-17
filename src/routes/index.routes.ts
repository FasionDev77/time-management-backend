import express from 'express';

import authRoutes from './auth.routes';
import recordRoutes from './record.routes';
import userRoutes from '../routes/user.routes'

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/records', recordRoutes);
router.use('/users', userRoutes);

export default router;
