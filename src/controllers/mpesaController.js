const fetch = require('node-fetch');
const pool = require('../db/pool');

const getAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');
  const res = await fetch(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } }
  );
  const data = await res.json();
  return data.access_token;
};

const stkPush = async (req, res) => {
  const { phone, amount, bookingRef } = req.body;
  if (!phone || !amount || !bookingRef) {
    return res.status(400).json({ error: 'Phone, amount and bookingRef are required' });
  }
  try {
    const token = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');
    const formattedPhone = phone.replace(/^0/, '254').replace(/^\+/, '');
    const body = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: `${process.env.MPESA_CALLBACK_URL}/api/mpesa/callback`,
      AccountReference: bookingRef,
      TransactionDesc: `StayNest booking ${bookingRef}`,
    };
    const response = await fetch(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    const data = await response.json();
    if (data.ResponseCode === '0') {
      res.json({ success: true, message: 'STK push sent', checkoutRequestId: data.CheckoutRequestID });
    } else {
      res.status(400).json({ error: data.errorMessage || 'STK push failed' });
    }
  } catch (err) {
    console.error('STK Push error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const stkCallback = async (req, res) => {
  const { Body } = req.body;
  try {
    const { stkCallback } = Body;
    const { ResultCode, CheckoutRequestID } = stkCallback;
    if (ResultCode === 0) {
      await pool.query(`UPDATE bookings SET status = 'paid' WHERE booking_ref = $1`, [CheckoutRequestID]);
    }
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (err) {
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  }
};

const registerC2B = async (req, res) => {
  try {
    const token = await getAccessToken();
    const body = {
      ShortCode: process.env.MPESA_SHORTCODE,
      ResponseType: 'Completed',
      ConfirmationURL: `${process.env.MPESA_CALLBACK_URL}/api/mpesa/c2b/confirm`,
      ValidationURL: `${process.env.MPESA_CALLBACK_URL}/api/mpesa/c2b/validate`,
    };
    const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl',
      { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const c2bValidate = (req, res) => res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

const c2bConfirm = async (req, res) => {
  const { BillRefNumber } = req.body;
  try {
    await pool.query(`UPDATE bookings SET status = 'paid' WHERE booking_ref = $1`, [BillRefNumber]);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
};

module.exports = { stkPush, stkCallback, registerC2B, c2bValidate, c2bConfirm };