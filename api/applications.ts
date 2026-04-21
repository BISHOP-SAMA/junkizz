import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import pg from "pg";
import { Resend } from "resend";
import { z } from "zod";

const { Pool } = pg;

// 1. Updated Table Definition
const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  quoteTweet: text("quote_tweet").notNull(),
  favoriteSlog: text("favorite_slog").notNull(), // Changed field name
  xUsername: text("x_username").notNull(),
  evmAddress: text("evm_address").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Updated Validation Schema
const insertSchema = z.object({
  quoteTweet: z.string().min(1),
  favoriteSlog: z.string().min(1), // Changed field name
  xUsername: z.string().min(1),
  evmAddress: z.string().min(1),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: "DATABASE_URL is not set" });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: "RESEND_API_KEY is not set" });
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const data = insertSchema.parse(req.body);
    const [application] = await db.insert(applications).values(data).returning();

    // 3. Updated Email Branding
    await resend.emails.send({
      from: "Slogs <onboarding@resend.dev>", // Changed from Junkyard
      to: "backyardjunkieseth@gmail.com",
      subject: "New Slog WL Application", // Changed Subject
      html: `
        <div style="font-family: sans-serif; border: 1px solid #f97316; padding: 20px; border-radius: 10px;">
          <h2 style="color: #f97316;">New Slog Application Received</h2>
          <p><strong>X Username:</strong> ${data.xUsername}</p>
          <p><strong>EVM Address:</strong> ${data.evmAddress}</p>
          <p><strong>Quote Tweet:</strong> ${data.quoteTweet}</p>
          <p><strong>Favorite Slog Info:</strong> ${data.favoriteSlog}</p>
          <hr />
          <p style="font-size: 10px; color: #999;">Sent from the Slogs Application Portal</p>
        </div>
      `,
    });

    return res.status(201).json(application);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await pool.end();
  }
}
