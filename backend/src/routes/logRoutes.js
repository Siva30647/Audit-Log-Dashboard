import express from 'express';
import { uploadLogs, getLogs, getStats, updateLogStatus } from '../controllers/logController.js';

const router = express.Router();

// Bulk upload logs
router.post('/bulk', uploadLogs);

// Get paginated, sorted, filtered logs
router.get('/', getLogs);

// Get dashboard stats
router.get('/stats', getStats);

// Update log status (Resolved / Unresolved / In Progress)
router.patch('/:id/status', updateLogStatus);

export default router;
