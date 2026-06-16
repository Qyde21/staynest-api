const pool = require("../db/pool");
const { sendBookingConfirmation, sendHostNewBooking } = require("../services/emailService");

const generateRef = () => {
  return "SN-" + Math.random().toString(36).substring(2, 8).toUpperCase();
};

const createBooking = async (req, res) => {
  const { propertyId, checkinDate, checkoutDate, guests, paymentMethod } = req.body;
  const userId = req.user.id;

  if (!propertyId || !checkinDate || !checkoutDate || !guests) {
    return res.status(400).json({ error: "All booking fields are required" });
  }

  try {
    const propResult = await pool.query(
      "SELECT p.*, u.email as host_email, u.first_name as host_first_name, u.last_name as host_last_name FROM properties p LEFT JOIN users u ON p.host_id = u.id WHERE p.id = $1 AND p.is_active = true",
      [propertyId]
    );

    if (propResult.rows.length === 0) {
      return res.status(404).json({ error: "Property not found" });
    }

    const property = propResult.rows[0];
    const checkin = new Date(checkinDate);
    const checkout = new Date(checkoutDate);
    const nights = Math.round((checkout - checkin) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      return res.status(400).json({ error: "Invalid dates" });
    }

    const subtotal = nights * property.price_per_night;
    const serviceFee = Math.round(subtotal * 0.12);
    const totalAmount = subtotal + serviceFee;
    const bookingRef = generateRef();

    const conflict = await pool.query(
      "SELECT id FROM bookings WHERE property_id = $1 AND status != $2 AND (checkin_date, checkout_date) OVERLAPS ($3::date, $4::date)",
      [propertyId, "cancelled", checkinDate, checkoutDate]
    );

    if (conflict.rows.length > 0) {
      return res.status(409).json({ error: "Property not available for selected dates" });
    }

    const result = await pool.query(
      "INSERT INTO bookings (property_id, user_id, checkin_date, checkout_date, guests, nights, total_amount, service_fee, payment_method, booking_ref) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
      [propertyId, userId, checkinDate, checkoutDate, guests, nights, totalAmount, serviceFee, paymentMethod || "mpesa", bookingRef]
    );

    const booking = result.rows[0];

    // Get guest details
    const guestResult = await pool.query(
      "SELECT first_name, last_name, email FROM users WHERE id = $1",
      [userId]
    );
    const guest = guestResult.rows[0];

    // Send emails
    await sendBookingConfirmation({
      guestEmail: guest.email,
      guestName: `${guest.first_name} ${guest.last_name}`,
      propertyTitle: property.title,
      location: property.location,
      checkin: checkinDate,
      checkout: checkoutDate,
      nights,
      total: totalAmount,
      bookingRef,
    });

    if (property.host_email) {
      await sendHostNewBooking({
        hostEmail: property.host_email,
        hostName: `${property.host_first_name} ${property.host_last_name}`,
        guestName: `${guest.first_name} ${guest.last_name}`,
        propertyTitle: property.title,
        checkin: checkinDate,
        checkout: checkoutDate,
        nights,
        total: totalAmount,
        bookingRef,
      });
    }

    res.status(201).json({
      message: "Booking confirmed",
      booking,
      property: { id: property.id, title: property.title },
    });
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getMyBookings = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      "SELECT b.*, p.title, p.location, p.images, p.category FROM bookings b JOIN properties p ON b.property_id = p.id WHERE b.user_id = $1 ORDER BY b.created_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const result = await pool.query(
      "UPDATE bookings SET status = $1 WHERE id = $2 AND user_id = $3 AND status = $4 RETURNING *",
      ["cancelled", id, userId, "confirmed"]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found or already cancelled" });
    }
    res.json({ message: "Booking cancelled", booking: result.rows[0] });
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createBooking, getMyBookings, cancelBooking };