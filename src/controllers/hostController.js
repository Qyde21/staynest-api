const pool = require("../db/pool");

const getHostStats = async (req, res) => {
  const hostId = req.user.id;
  try {
    const [properties, bookings, revenue] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM properties WHERE host_id = $1 AND is_active = true", [hostId]),
      pool.query("SELECT COUNT(*) FROM bookings b JOIN properties p ON b.property_id = p.id WHERE p.host_id = $1", [hostId]),
      pool.query("SELECT COALESCE(SUM(b.total_amount), 0) as total FROM bookings b JOIN properties p ON b.property_id = p.id WHERE p.host_id = $1 AND b.status != $2", [hostId, "cancelled"]),
    ]);
    const recentBookings = await pool.query(
      "SELECT b.*, p.title, p.location, u.first_name, u.last_name FROM bookings b JOIN properties p ON b.property_id = p.id JOIN users u ON b.user_id = u.id WHERE p.host_id = $1 ORDER BY b.created_at DESC LIMIT 5",
      [hostId]
    );
    res.json({
      totalProperties: parseInt(properties.rows[0].count),
      totalBookings: parseInt(bookings.rows[0].count),
      totalRevenue: parseInt(revenue.rows[0].total),
      recentBookings: recentBookings.rows,
    });
  } catch (err) {
    console.error("Host stats error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getHostProperties = async (req, res) => {
  const hostId = req.user.id;
  try {
    const result = await pool.query("SELECT * FROM properties WHERE host_id = $1 ORDER BY created_at DESC", [hostId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getHostBookings = async (req, res) => {
  const hostId = req.user.id;
  try {
    const result = await pool.query(
      "SELECT b.*, p.title, p.location, u.first_name, u.last_name, u.email, u.phone FROM bookings b JOIN properties p ON b.property_id = p.id JOIN users u ON b.user_id = u.id WHERE p.host_id = $1 ORDER BY b.created_at DESC",
      [hostId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const addHostProperty = async (req, res) => {
  const hostId = req.user.id;
  const { title, location, category, price_per_night, beds, baths, max_guests, highlight, description, amenities, images } = req.body;
  if (!title || !location || !category || !price_per_night) {
    return res.status(400).json({ error: "Title, location, category and price are required" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO properties (title, location, category, price_per_night, beds, baths, max_guests, highlight, description, amenities, images, host_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
      [title, location, category, Number(price_per_night), Number(beds) || 1, Number(baths) || 1, Number(max_guests) || 2,
       highlight || null, description || null,
       amenities ? amenities.split(",").map(a => a.trim()) : [],
       images ? images.split(",").map(i => i.trim()) : [],
       hostId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Add host property error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const toggleHostProperty = async (req, res) => {
  const hostId = req.user.id;
  try {
    const result = await pool.query(
      "UPDATE properties SET is_active = NOT is_active WHERE id = $1 AND host_id = $2 RETURNING *",
      [req.params.id, hostId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getHostStats, getHostProperties, getHostBookings, addHostProperty, toggleHostProperty };