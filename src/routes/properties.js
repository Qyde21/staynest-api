const express = require('express');
const router = express.Router();
const { getAllProperties, getPropertyById, getPropertiesByCategory } = require('../controllers/propertiesController');

router.get('/', getAllProperties);
router.get('/category/:category', getPropertiesByCategory);
router.get('/:id', getPropertyById);

module.exports = router;
