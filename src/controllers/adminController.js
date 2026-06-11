const pool = require("../db/pool");

const getStats = async (req, res) => {
  try {
    const [users, properties, bookings, revenue] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COUNT(*) FROM properties WHERE is_active = true"),
      pool.query("SELECT COUNT(*) FROM bookings"),
      pool.query("SELECT COALESCE(SUM(total_amount), 0) as total FROM bookings WHERE status != $1", ["cancelled"]),
    ]);
    const recentBookings = await pool.query(
      `SELECT b.*, p.title, p.location, u.first_name, u.last_name
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC LIMIT 5`
    );
    res.json({
      totalUsers: parseInt(users.rows[0].count),
      totalProperties: parseInt(properties.rows[0].count),
      totalBookings: parseInt(bookings.rows[0].count),
      totalRevenue: parseInt(revenue.rows[0].total),
      recentBookings: recentBookings.rows,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, first_name, last_name, email, phone, is_host, is_admin, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [req.params.id]);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, p.title, p.location, u.first_name, u.last_name, u.email
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE bookings SET status = "cancelled" WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getProperties = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM properties ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const toggleProperty = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE properties SET is_active = NOT is_active WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const addProperty = async (req, res) => {
  const { title, location, category, price_per_night, beds, baths, max_guests, highlight, description, amenities, images } = req.body;
  if (!title || !location || !category || !price_per_night) {
    return res.status(400).json({ error: "Title, location, category and price are required" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO properties (title, location, category, price_per_night, beds, baths, max_guests, highlight, description, amenities, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [title, location, category, Number(price_per_night), Number(beds) || 1, Number(baths) || 1, Number(max_guests) || 2,
       highlight || null, description || null,
       amenities ? amenities.split(",").map(a => a.trim()) : [],
       images ? images.split(",").map(i => i.trim()) : []]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Add property error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getReviews = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, p.title as property_title
       FROM reviews r
       JOIN properties p ON r.property_id = p.id
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const deleteReview = async (req, res) => {
  try {
    await pool.query("DELETE FROM reviews WHERE id = $1", [req.params.id]);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getStats, getUsers, deleteUser, getBookings, cancelBooking, getProperties, toggleProperty, addProperty, getReviews, deleteReview };