const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL || "onboarding@resend.dev";

const sendBookingConfirmation = async ({ guestEmail, guestName, propertyTitle, location, checkin, checkout, nights, total, bookingRef }) => {
  try {
    await resend.emails.send({
      from: FROM,
      to: guestEmail,
      subject: `Booking Confirmed - ${propertyTitle} | StayNest`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #c4704a; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">StayNest</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">Your booking is confirmed!</p>
          </div>
          <div style="background: #ffffff; padding: 32px; border: 1px solid #e8e0d0; border-top: none;">
            <h2 style="color: #1a1410; margin-top: 0;">Hi ${guestName},</h2>
            <p style="color: #3d3530;">Your booking has been confirmed. Here are your details:</p>
            <div style="background: #f5f0e8; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1a1410; margin-top: 0;">${propertyTitle}</h3>
              <p style="color: #7a7068; margin: 4px 0;">${location}</p>
              <hr style="border: none; border-top: 1px solid #e8e0d0; margin: 16px 0;" />
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #7a7068;">Check-in</td><td style="padding: 8px 0; color: #1a1410; font-weight: bold; text-align: right;">${checkin}</td></tr>
                <tr><td style="padding: 8px 0; color: #7a7068;">Check-out</td><td style="padding: 8px 0; color: #1a1410; font-weight: bold; text-align: right;">${checkout}</td></tr>
                <tr><td style="padding: 8px 0; color: #7a7068;">Nights</td><td style="padding: 8px 0; color: #1a1410; font-weight: bold; text-align: right;">${nights}</td></tr>
                <tr style="border-top: 1px solid #e8e0d0;"><td style="padding: 12px 0; color: #1a1410; font-weight: bold;">Total Paid</td><td style="padding: 12px 0; color: #c4704a; font-weight: bold; text-align: right; font-size: 18px;">KES ${total.toLocaleString()}</td></tr>
              </table>
            </div>
            <p style="color: #7a7068; font-size: 14px;">Booking Reference: <strong style="color: #1a1410;">${bookingRef}</strong></p>
            <a href="https://staynest-indol.vercel.app/my-bookings" style="display: inline-block; background: #c4704a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px;">View My Bookings</a>
          </div>
          <div style="background: #1a1410; padding: 20px; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="color: #7a7068; margin: 0; font-size: 13px;">StayNest Kenya | support@staynest.co.ke</p>
          </div>
        </div>
      `,
    });
    console.log("Confirmation email sent to", guestEmail);
  } catch (err) {
    console.error("Email error:", err);
  }
};

const sendHostNewBooking = async ({ hostEmail, hostName, guestName, propertyTitle, checkin, checkout, nights, total, bookingRef }) => {
  try {
    await resend.emails.send({
      from: FROM,
      to: hostEmail,
      subject: `New Booking - ${propertyTitle} | StayNest`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #c4704a; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">StayNest</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">You have a new booking!</p>
          </div>
          <div style="background: #ffffff; padding: 32px; border: 1px solid #e8e0d0; border-top: none;">
            <h2 style="color: #1a1410; margin-top: 0;">Hi ${hostName},</h2>
            <p style="color: #3d3530;">You have a new booking for <strong>${propertyTitle}</strong>.</p>
            <div style="background: #f5f0e8; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #7a7068;">Guest</td><td style="padding: 8px 0; color: #1a1410; font-weight: bold; text-align: right;">${guestName}</td></tr>
                <tr><td style="padding: 8px 0; color: #7a7068;">Check-in</td><td style="padding: 8px 0; color: #1a1410; font-weight: bold; text-align: right;">${checkin}</td></tr>
                <tr><td style="padding: 8px 0; color: #7a7068;">Check-out</td><td style="padding: 8px 0; color: #1a1410; font-weight: bold; text-align: right;">${checkout}</td></tr>
                <tr><td style="padding: 8px 0; color: #7a7068;">Nights</td><td style="padding: 8px 0; color: #1a1410; font-weight: bold; text-align: right;">${nights}</td></tr>
                <tr style="border-top: 1px solid #e8e0d0;"><td style="padding: 12px 0; color: #1a1410; font-weight: bold;">Total Earned</td><td style="padding: 12px 0; color: #c4704a; font-weight: bold; text-align: right; font-size: 18px;">KES ${total.toLocaleString()}</td></tr>
              </table>
            </div>
            <p style="color: #7a7068; font-size: 14px;">Booking Reference: <strong style="color: #1a1410;">${bookingRef}</strong></p>
            <a href="https://staynest-indol.vercel.app/host" style="display: inline-block; background: #c4704a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px;">View Host Dashboard</a>
          </div>
          <div style="background: #1a1410; padding: 20px; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="color: #7a7068; margin: 0; font-size: 13px;">StayNest Kenya | support@staynest.co.ke</p>
          </div>
        </div>
      `,
    });
    console.log("Host email sent to", hostEmail);
  } catch (err) {
    console.error("Host email error:", err);
  }
};

module.exports = { sendBookingConfirmation, sendHostNewBooking };