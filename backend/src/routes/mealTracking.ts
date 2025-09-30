// Meal Tracking API routes

import express from 'express';

const router = express.Router();

// Placeholder routes - to be implemented with full service
router.get('/', async (req, res) => {
  res.json({ message: 'Meal tracking endpoint - coming soon' });
});

router.post('/', async (req, res) => {
  res.json({ message: 'Create meal tracking - coming soon' });
});

export default router;