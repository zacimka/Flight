const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: (process.env.EMAIL_PORT || 465) == 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateTicketPDF = (booking) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  // Professional Header
  doc.fillColor("#2563eb").fontSize(26).text("Travelopro Official E-Ticket", { align: "center", font: "Helvetica-Bold" });
  doc.moveDown();
  doc.strokeColor("#eee").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  // Booking Stats
  doc.fillColor("#333").fontSize(10).text("RECORD LOCATOR (PNR):", { continued: true }).fillColor("#2563eb").fontSize(14).text(`  ${booking.pnr || "N/A"}`, { font: "Helvetica-Bold" });
  doc.fillColor("#333").fontSize(10).text("ORDER ID:", { continued: true }).fontSize(10).text(`  ${booking._id}`);
  doc.text("STATUS:", { continued: true }).fillColor("green").text(`  ${booking.status.toUpperCase()}`);
  doc.moveDown();

  // Itinerary
  doc.fillColor("#2563eb").fontSize(14).text("Flight Itinerary", { underline: true });
  doc.moveDown(0.5);
  doc.fillColor("#333").fontSize(12).text(`${booking.airline} - Flight ${booking.flightNumber}`);
  doc.fontSize(10).text(`${booking.airportFrom} → ${booking.airportTo}`);
  doc.text(`Departure: ${booking.departureDate ? new Date(booking.departureDate).toLocaleString() : "N/A"}`);
  doc.text(`Arrival: ${booking.arrivalDate ? new Date(booking.arrivalDate).toLocaleString() : "N/A"}`);
  doc.moveDown();

  // Passengers
  doc.fillColor("#2563eb").fontSize(14).text("Passenger Manifest", { underline: true });
  doc.moveDown(0.5);
  doc.fillColor("#333").fontSize(11);
  (booking.passengers || []).forEach((p, i) => {
    doc.text(`${i + 1}. ${p.firstName} ${p.lastName} (${p.type}) - ${booking.ticketNumbers?.[i] || "PENDING"}`);
  });
  doc.moveDown();

  // Finances
  doc.fillColor("#2563eb").fontSize(14).text("Financial Summary", { underline: true });
  doc.moveDown(0.5);
  doc.fillColor("#333").fontSize(10).text(`Base Fare: $${Number(booking.basePrice).toFixed(2)}`);
  doc.text(`Service Fee: $${Number(booking.markup).toFixed(2)}`);
  doc.fontSize(14).fillColor("#2563eb").text(`Total Paid: $${Number(booking.finalPrice).toFixed(2)}`, { font: "Helvetica-Bold" });

  doc.moveDown(2);
  doc.fillColor("#999").fontSize(8).text("This is a computer-generated document. No signature required.", { align: "center" });

  doc.end();

  return new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
};

const sendTicketEmail = async (to, booking) => {
  const pdfBuffer = await generateTicketPDF(booking);
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || "noreply@travelopro.local",
    to,
    subject: `Booking Confirmation - ${booking.airline} ${booking.flightNumber}`,
    html: `
      <div style="font-family: sans-serif; color: #333;">
        <h2 style="color: #2563eb;">Flight Booking Confirmation</h2>
        <p>Dear Customer,</p>
        <p>Thank you for booking with Travelopro! Your flight has been confirmed.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>PNR:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 1.2em;">${booking.pnr}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Flight:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.airline} ${booking.flightNumber}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Route:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.airportFrom} → ${booking.airportTo}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Status:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-transform: uppercase; font-weight: bold; color: green;">${booking.status}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Total Price:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 1.2em; color: #2563eb;">$${booking.finalPrice.toFixed(2)}</td></tr>
        </table>
        <p style="margin-top: 30px;">Your ticket is attached as a PDF.</p>
        <p>Safe travels!</p>
        <p><strong>The Travelopro Team</strong></p>
      </div>
    `,
    attachments: [{ filename: "e-ticket.pdf", content: pdfBuffer }],
  };

  return transporter.sendMail(mailOptions);
};

const sendContactNotification = async (contact) => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@travelopro.local";
  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@travelopro.local",
    to: adminEmail,
    subject: `New Contact Message from ${contact.name}`,
    html: `<h2>New Contact Submission</h2><p><strong>Name:</strong> ${contact.name}</p><p>${contact.message}</p>`,
  };
  return transporter.sendMail(mailOptions);
};

module.exports = { sendTicketEmail, generateTicketPDF, sendContactNotification };
