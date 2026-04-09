const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");

/**
 * Modernized Nodemailer Transport
 * Uses environment variables configured in Render
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: (process.env.SMTP_PORT || 465) == 465,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_SERVICE_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_SERVICE_PASS || process.env.EMAIL_PASS,
  },
});

/**
 * Professional PDF Generation for ZamGo Travel
 */
const generateTicketPDF = (booking) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  // Professional Header
  doc.fillColor("#4f46e5").fontSize(26).text("ZamGo Travel Official E-Ticket", { align: "center", font: "Helvetica-Bold" });
  doc.moveDown();
  doc.strokeColor("#eee").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  // Booking Stats
  doc.fillColor("#333").fontSize(10).text("RECORD LOCATOR (PNR):", { continued: true }).fillColor("#4f46e5").fontSize(14).text(`  ${booking.pnr || "N/A"}`, { font: "Helvetica-Bold" });
  doc.fillColor("#333").fontSize(10).text("ORDER ID:", { continued: true }).fontSize(10).text(`  ${booking.orderId || booking.id}`);
  doc.text("STATUS:", { continued: true }).fillColor("green").text(`  CONFIRMED`);
  doc.moveDown();

  // Itinerary
  doc.fillColor("#4f46e5").fontSize(14).text("Flight Itinerary", { underline: true });
  doc.moveDown(0.5);
  doc.fillColor("#333").fontSize(12).text(`${booking.airline} - Flight ${booking.flightNumber}`);
  doc.fontSize(10).text(`${booking.airportFrom} → ${booking.airportTo}`);
  doc.text(`Departure: ${booking.departureDate}`);
  doc.text(`Arrival: ${booking.arrivalDate}`);
  doc.moveDown();

  // Passengers
  doc.fillColor("#4f46e5").fontSize(14).text("Passenger Manifest", { underline: true });
  doc.moveDown(0.5);
  doc.fillColor("#333").fontSize(11);
  (booking.passengers || []).forEach((p, i) => {
    doc.text(`${i + 1}. ${p.given_name} ${p.family_name} (${p.type || "adult"})`);
  });
  doc.moveDown();

  // Finances
  doc.fillColor("#4f46e5").fontSize(14).text("Financial Summary", { underline: true });
  doc.moveDown(0.5);
  doc.fillColor("#333").fontSize(10).text(`Total Amount Paid: ${booking.currency} ${booking.totalPrice}`, { font: "Helvetica-Bold" });

  doc.moveDown(2);
  doc.fillColor("#999").fontSize(8).text("This is an official ZamGo Travel computer-generated document. No signature required.", { align: "center" });

  doc.end();

  return new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
};

/**
 * Send Professional HTML Confirmation Email
 */
const sendConfirmationEmail = async (to, booking) => {
  try {
    const pdfBuffer = await generateTicketPDF(booking);
    
    const mailOptions = {
      from: `"ZamGo Travel" <${process.env.SMTP_USER || process.env.EMAIL_USER || 'info@zamgotravel.com'}>`,
      to,
      subject: `Your Flight is Confirmed! (PNR: ${booking.pnr}) - ZamGo Travel`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .header { background: #4f46e5; padding: 30px 20px; text-align: center; color: white; }
            .header img { height: 60px; margin-bottom: 10px; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
            .header p { margin: 5px 0 0; opacity: 0.9; font-weight: 500; }
            .content { padding: 30px; }
            .booking-card { background: #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #4f46e5; }
            .label { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
            .value { font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 12px; }
            .pnr { font-size: 24px; color: #4f46e5; font-weight: 800; margin: 5px 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 13px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
            .footer a { color: #4f46e5; text-decoration: none; font-weight: 600; }
            .airline-logo { font-size: 1.2em; font-weight: bold; color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px; display: block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://www.zamgotravel.com/images/zamgo_logo.jpg" alt="ZamGo Travel Logo">
              <h1>ZamGo Travel</h1>
              <p>Thanks for choosing ZamGo Travel! Your flight is confirmed.</p>
            </div>
            
            <div class="content">
              <div class="booking-card">
                <div class="label">Booking Reference (PNR)</div>
                <div class="pnr">${booking.pnr}</div>
                
                <div style="display: flex; justify-content: space-between; margin-top: 15px;">
                  <div style="flex: 1;">
                     <div class="label">Date</div>
                     <div class="value">${booking.departureDate}</div>
                  </div>
                  <div style="flex: 1;">
                     <div class="label">Flight Number</div>
                     <div class="value">${booking.airline} ${booking.flightNumber}</div>
                  </div>
                </div>
              </div>

              <div class="airline-logo">${booking.airline} Ticket Details</div>

              <p><strong>Passengers:</strong><br/>
              ${(booking.passengers || []).map(p => `${p.given_name} ${p.family_name}`).join(', ')}</p>

              <table style="width: 100%; margin-top: 20px;">
                <tr>
                  <td style="font-size: 14px; color: #6b7280;">Route:</td>
                  <td style="text-align: right; font-weight: 600;">${booking.airportFrom} &rarr; ${booking.airportTo}</td>
                </tr>
                <tr>
                  <td style="font-size: 14px; color: #6b7280;">Total Price Paid:</td>
                  <td style="text-align: right; font-weight: 800; color: #4f46e5; font-size: 18px;">${booking.currency} ${booking.totalPrice}</td>
                </tr>
              </table>

              <p style="background: #eff6ff; color: #1e40af; padding: 15px; border-radius: 8px; font-size: 13px; margin-top: 25px;">
                <strong>Note:</strong> Your official e-ticket is attached as a PDF. Please present it at the check-in counter along with your valid ID/Passport.
              </p>
            </div>

            <div class="footer">
              If you have any questions, contact us at <a href="mailto:support@zamgotravel.com">support@zamgotravel.com</a><br/>
              &copy; 2026 ZamGo Travel. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [{ filename: `ZamGo-Travel-Ticket-${booking.pnr}.pdf`, content: pdfBuffer }],
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email Service Failure:", error.message);
    throw error;
  }
};

module.exports = { sendConfirmationEmail };
