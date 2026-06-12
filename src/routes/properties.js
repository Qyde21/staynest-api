const express = require("express");
const router = express.Router();
const { getAllProperties, getPropertyById, getPropertiesByCategory, getPropertyAvailability } = require("../controllers/propertiesController");

router.get("/", getAllProperties);
router.get("/category/:category", getPropertiesByCategory);
router.get("/:id/availability", getPropertyAvailability);
router.get("/:id", getPropertyById);

module.exports = router;