import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import nodemailer from "nodemailer";

const createTransporter = async (opts?: { secure?: boolean; port?: number }) => {
  const user = (process.env.GMAIL_EMAIL || "").trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s/g, "");
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: opts?.port ?? 587,
    secure: opts?.secure ?? false,
    auth: { user, pass },
    authMethod: "PLAIN",
  });
  return transporter;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, items, pricing } = body;

    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid order details or empty cart." },
        { status: 400 },
      );
    }

    const orderId = `PYR-${Date.now().toString().slice(-6)}`;
    const fullName = `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "N/A";
    const company = customer.companyName || "N/A";
    const gst = customer.gstOrAadhar || "N/A";
    const address = [customer.streetAddress1, customer.streetAddress2, customer.city, customer.state, customer.postcode, customer.country]
      .filter(Boolean)
      .join(", ");
    const phone = customer.phone || "N/A";
    const email = customer.email || "N/A";
    const notes = customer.orderNotes || "None";

    const subtotal = pricing?.subtotal || items.reduce((s: number, i: any) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
    const gstAmount = pricing?.gst || Math.round(subtotal * 0.18 * 100) / 100;
    const total = pricing?.total || subtotal + gstAmount;

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 650px; margin: 20px auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 8px; }
        .header { background-color: #0F172A; color: #fff; padding: 16px 20px; border-radius: 6px 6px 0 0; }
        .header h2 { margin: 0; font-size: 20px; }
        .header p { margin: 4px 0 0; font-size: 13px; color: #94a3b8; }
        .badge { display: inline-block; padding: 4px 10px; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-weight: bold; font-size: 12px; }
        .section-title { font-size: 15px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: #0F172A; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        .table th, .table td { padding: 9px 12px; border: 1px solid #e2e8f0; text-align: left; }
        .table th { background-color: #f8fafc; font-weight: bold; }
        .totals { margin-top: 15px; width: 100%; max-width: 300px; margin-left: auto; font-size: 14px; }
        .totals td { padding: 6px 10px; }
        .footer { text-align: center; margin-top: 25px; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Proforma Order Received (#${orderId})</h2>
          <p>Submitted on ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
        </div>

        <div class="section-title">Customer & Billing Details</div>
        <table class="table">
          <tr><th style="width: 30%;">Full Name</th><td>${fullName}</td></tr>
          <tr><th>Company</th><td>${company}</td></tr>
          <tr><th>Phone</th><td><a href="tel:${phone}">${phone}</a></td></tr>
          <tr><th>Email</th><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><th>GST / Aadhar</th><td>${gst}</td></tr>
          <tr><th>Shipping Address</th><td>${address}</td></tr>
          <tr><th>State & ZIP</th><td>${customer.state || "N/A"} - ${customer.postcode || "N/A"}</td></tr>
          <tr><th>Order Notes</th><td>${notes}</td></tr>
        </table>

        <div class="section-title">Items Ordered (${items.length})</div>
        <table class="table">
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">MOQ</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item: any) => `
              <tr>
                <td><strong>${item.name}</strong></td>
                <td style="text-align: center;">${item.moq || 50}</td>
                <td style="text-align: right;">₹${Number(item.price).toLocaleString()}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;"><strong>₹${(Number(item.price) * Number(item.quantity)).toLocaleString()}</strong></td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <table class="totals">
          <tr>
            <td>Items Subtotal:</td>
            <td style="text-align: right; font-weight: bold;">₹${subtotal.toLocaleString()}</td>
          </tr>
          <tr>
            <td>GST (18%):</td>
            <td style="text-align: right; font-weight: bold;">₹${gstAmount.toLocaleString()}</td>
          </tr>
          <tr style="border-top: 2px solid #0F172A;">
            <td style="font-size: 16px; font-weight: bold;">Total Basic:</td>
            <td style="font-size: 16px; font-weight: bold; text-align: right; color: #0F172A;">₹${total.toLocaleString()}</td>
          </tr>
        </table>

        <div class="footer">
          <p><strong>Note:</strong> Shipping charges will be calculated and provided on the finalized proforma invoice.</p>
          <p>Pyrite App • Automated Order Notification</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const primaryRecipient = process.env.ENQUIRY_RECIPIENT_EMAIL || process.env.GMAIL_EMAIL;
    const forwardRecipient = process.env.ENQUIRY_FORWARD_EMAIL;
    const recipientList = Array.from(new Set([forwardRecipient, primaryRecipient].filter(Boolean))).join(",");

    if (process.env.GMAIL_EMAIL && process.env.GMAIL_APP_PASSWORD && recipientList) {
      const mailOptions = {
        from: `"Pyrite Orders" <${process.env.GMAIL_EMAIL}>`,
        to: recipientList,
        replyTo: email,
        subject: `New Proforma Order #${orderId}: ${fullName} (₹${total.toLocaleString()})`,
        html: htmlContent,
      };

      try {
        await (await createTransporter({ port: 587, secure: false })).sendMail(mailOptions);
        console.log(`Order email sent for #${orderId}`);
      } catch (firstErr: any) {
        console.warn("Retrying order email on port 465 SSL:", firstErr?.message);
        try {
          await (await createTransporter({ port: 465, secure: true })).sendMail(mailOptions);
        } catch (retryErr: any) {
          console.error("Order email error:", retryErr?.message);
          // don't crash client response if SMTP fails, order is logged
        }
      }
    } else {
      console.log("Email notifications not fully configured. Order logged:", { orderId, fullName, total });
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: "Your order request has been received. Our sales executive will contact you shortly.",
    });
  } catch (error: any) {
    console.error("Checkout route error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to process order." },
      { status: 500 },
    );
  }
}
