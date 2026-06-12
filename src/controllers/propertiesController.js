const pool = require("../db/pool");

// GET /api/properties
const getAllProperties = async (req, res) => {
  const { category, minPrice, maxPrice, guests, sort, location } = req.query;
  let query = "SELECT * FROM properties WHERE is_active = true";
  const params = [];
  let paramIndex = 1;

  if (category && category !== "all") {
    query += ` AND category = $${paramIndex++}`;
    params.push(category);
  }
  if (location) {
    query += ` AND (LOWER(title) LIKE $${paramIndex} OR LOWER(location) LIKE $${paramIndex})`;
    params.push(`%${location.toLowerCase()}%`);
    paramIndex++;
  }
  if (minPrice) {
    query += ` AND price_per_night >= $${paramIndex++}`;
    params.push(Number(minPrice));
  }
  if (maxPrice) {
    query += ` AND price_per_night <= $${paramIndex++}`;
    params.push(Number(maxPrice));
  }
  if (guests) {
    query += ` AND max_guests >= $${paramIndex++}`;
    params.push(Number(guests));
  }

  if (sort === "price-asc") query += " ORDER BY price_per_night ASC";
  else if (sort === "price-desc") query += " ORDER BY price_per_night DESC";
  else if (sort === "rating") query += " ORDER BY rating DESC";
  else query += " ORDER BY id ASC";

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Get properties error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/properties/:id
const getPropertyById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM properties WHERE id = $1 AND is_active = true",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get property error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/properties/category/:category
const getPropertiesByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM properties WHERE category = $1 AND is_active = true ORDER BY rating DESC",
      [category]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get by category error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/properties/:id/availability
const getPropertyAvailability = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT checkin_date, checkout_date FROM bookings
       WHERE property_id = $1 AND status != 'cancelled'
       AND checkout_date >= CURRENT_DATE
       ORDER BY checkin_date ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get availability error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getAllProperties, getPropertyById, getPropertiesByCategory, getPropertyAvailability };