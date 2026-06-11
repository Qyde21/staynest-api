const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/admin");
const {
  getStats, getUsers, deleteUser,
  getBookings, cancelBooking,
  getProperties, toggleProperty, addProperty,
  getReviews, deleteReview
} = require("../controllers/adminController");

router.use(adminMiddleware);
router.get("/stats", getStats);
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);
router.get("/bookings", getBookings);
router.put("/bookings/:id/cancel", cancelBooking);
router.get("/properties", getProperties);
router.put("/properties/:id/toggle", toggleProperty);
router.post("/properties", addProperty);
router.get("/reviews", getReviews);
router.delete("/reviews/:id", deleteReview);

module.exports = router;