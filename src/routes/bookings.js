const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, cancelBooking } = require('../controllers/bookingsController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, createBooking);
router.get('/my', authMiddleware, getMyBookings);
router.delete('/:id', authMiddleware, cancelBooking);

module.exports = router;
