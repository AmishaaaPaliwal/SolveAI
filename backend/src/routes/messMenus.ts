// Mess Menus API routes

import express from 'express';

const router = express.Router();

// Placeholder routes - to be implemented with full service
router.get('/', async (req, res) => {
  res.json({ message: 'Mess menus endpoint - coming soon' });
});

router.post('/', async (req, res) => {
  res.json({ message: 'Create mess menu - coming soon' });
});

export default router;