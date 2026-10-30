import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { cmsCatalog } from "@/lib/cms/load";
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanField(value: unknown, maxLength = 500): string {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, maxLength) : "";
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]!);
}

function formatAmount(value: number): string {
  return value.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

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
    const customerInput = body?.customer;
    const itemsInput = body?.items;

    if (!customerInput || typeof customerInput !== "object" || !Array.isArray(itemsInput) || itemsInput.length === 0 || itemsInput.length > 30) {
      return NextResponse.json(
        { success: false, message: "Please check your order details and try again." },
        { status: 400 },
      );
    }

    const customer = {
      firstName: cleanField(customerInput.firstName, 80),
      lastName: cleanField(customerInput.lastName, 80),
      companyName: cleanField(customerInput.companyName, 120),
      gstOrAadhar: cleanField(customerInput.gstOrAadhar, 40),
      streetAddress1: cleanField(customerInput.streetAddress1, 200),
      streetAddress2: cleanField(customerInput.streetAddress2, 200),
      city: cleanField(customerInput.city, 80),
      state: cleanField(customerInput.state, 80),
      postcode: cleanField(customerInput.postcode, 20),
      country: cleanField(customerInput.country, 80),
      phone: cleanField(customerInput.phone, 32),
      email: cleanField(customerInput.email, 254),
      orderNotes: cleanField(customerInput.orderNotes, 1000),
    };
    if (
      !customer.firstName || !customer.lastName || !customer.streetAddress1 || !customer.city ||
      !customer.postcode || !customer.phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)
    ) {
      return NextResponse.json({ success: false, message: "Please provide valid contact and billing details." }, { status: 400 });
    }

    const catalog = await cmsCatalog();
    const seenIds = new Set<string>();
    const items = [] as { name: string; moq: number; price: number; quantity: number }[];
    for (const raw of itemsInput) {
      const id = raw?.id == null ? "" : String(raw.id);
      const slug = cleanField(raw?.slug, 200);
      const product = catalog.find((entry) => (id && String(entry.id) === id) || (slug && entry.slug === slug));
      if (!product || !product.enabled || seenIds.has(product.id)) {
        return NextResponse.json({ success: false, message: "An item in your cart is unavailable. Please refresh and try again." }, { status: 409 });
      }
      seenIds.add(product.id);

      const quantity = Number(raw?.quantity);
      const moq = Math.max(1, Number(product.moq) || 1);
      const price = Number(product.minPrice);
      if (!Number.isSafeInteger(quantity) || quantity < moq || quantity > 1_000_000) {
        return NextResponse.json({ success: false, message: `The minimum quantity for ${product.name} is ${moq}.` }, { status: 400 });
      }
      if (product.minPrice == null || !Number.isFinite(price) || price <= 0) {
        return NextResponse.json({ success: false, message: "We need to confirm a current price for an item in your cart. Please contact our team." }, { status: 409 });
      }
      items.push({ name: product.name, moq, price, quantity });
    }

    const orderId = `PYR-${randomUUID().slice(0, 8).toUpperCase()}`;
    const fullName = `${customer.firstName} ${customer.lastName}`.trim();
    const company = customer.companyName || "N/A";
    const gst = customer.gstOrAadhar || "N/A";
    const address = [customer.streetAddress1, customer.streetAddress2, customer.city, customer.state, customer.postcode, customer.country]
      .filter(Boolean)
      .join(", ");
    const phone = customer.phone;
    const email = customer.email;
    const notes = customer.orderNotes || "None";

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const gstAmount = Math.round(subtotal * 0.18 * 100) / 100;
    const total = subtotal + gstAmount;

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
          <tr><th style="width: 30%;">Full Name</th><td>${escapeHtml(fullName)}</td></tr>
          <tr><th>Company</th><td>${escapeHtml(company)}</td></tr>
          <tr><th>Phone</th><td><a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></td></tr>
          <tr><th>Email</th><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
          <tr><th>GST / Aadhar</th><td>${escapeHtml(gst)}</td></tr>
          <tr><th>Shipping Address</th><td>${escapeHtml(address)}</td></tr>
          <tr><th>State & ZIP</th><td>${escapeHtml(customer.state || "N/A")} - ${escapeHtml(customer.postcode || "N/A")}</td></tr>
          <tr><th>Order Notes</th><td>${escapeHtml(notes)}</td></tr>
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
                (item) => `
              <tr>
                <td><strong>${escapeHtml(item.name)}</strong></td>
                <td style="text-align: center;">${item.moq || 50}</td>
                <td style="text-align: right;">₹${formatAmount(item.price)}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;"><strong>₹${formatAmount(item.price * item.quantity)}</strong></td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <table class="totals">
          <tr>
            <td>Items Subtotal:</td>
            <td style="text-align: right; font-weight: bold;">₹${formatAmount(subtotal)}</td>
          </tr>
          <tr>
            <td>GST (18%):</td>
            <td style="text-align: right; font-weight: bold;">₹${formatAmount(gstAmount)}</td>
          </tr>
          <tr style="border-top: 2px solid #0F172A;">
            <td style="font-size: 16px; font-weight: bold;">Total Basic:</td>
            <td style="font-size: 16px; font-weight: bold; text-align: right; color: #0F172A;">₹${formatAmount(total)}</td>
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

    if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD || !recipientList) {
      return NextResponse.json(
        { success: false, message: "Order requests are temporarily unavailable. Please contact our team directly." },
        { status: 503 },
      );
    }

    {
      const mailOptions = {
        from: `"Pyrite Orders" <${process.env.GMAIL_EMAIL}>`,
        to: recipientList,
        replyTo: email,
        subject: `New Proforma Order #${orderId}: ${fullName} (₹${formatAmount(total)})`,
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
          return NextResponse.json(
            { success: false, message: "We couldn't submit your order request. Please try again or contact our team." },
            { status: 502 },
          );
        }
      }
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
