const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { getHostStats, getHostProperties, getHostBookings, addHostProperty, toggleHostProperty } = require("../controllers/hostController");

router.use(authMiddleware);
router.get("/stats", getHostStats);
router.get("/properties", getHostProperties);
router.get("/bookings", getHostBookings);
router.post("/properties", addHostProperty);
router.put("/properties/:id/toggle", toggleHostProperty);

module.exports = router;