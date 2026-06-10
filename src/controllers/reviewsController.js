const pool = require('../db/pool');

// POST /api/reviews
const createReview = async (req, res) => {
  const { propertyId, rating, comment } = req.body;
  const userId = req.user.id;

  if (!propertyId || !rating) {
    return res.status(400).json({ error: 'Property and rating are required' });
  }

  try {
    // Get reviewer name
    const userResult = await pool.query(
      'SELECT first_name, last_name FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];
    const reviewerName = `${user.first_name} ${user.last_name}`;

    // Insert review
    const result = await pool.query(
      `INSERT INTO reviews (property_id, user_id, rating, comment, reviewer_name)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [propertyId, userId, rating, comment || null, reviewerName]
    );

    // Update property rating
    await pool.query(
      `UPDATE properties SET
        rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE property_id = $1),
        review_count = (SELECT COUNT(*) FROM reviews WHERE property_id = $1)
       WHERE id = $1`,
      [propertyId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/reviews/:propertyId
const getPropertyReviews = async (req, res) => {
  const { propertyId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM reviews WHERE property_id = $1 ORDER BY created_at DESC`,
      [propertyId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createReview, getPropertyReviews };