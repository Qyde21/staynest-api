const express = require('express');
const router = express.Router();
const { createReview, getPropertyReviews } = require('../controllers/reviewsController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, createReview);
router.get('/:propertyId', getPropertyReviews);

module.exports = router;