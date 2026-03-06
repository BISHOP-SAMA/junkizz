import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";
import pg from "pg";
import { z } from "zod";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  quoteTweet: text("quote_tweet").notNull(),
  favoriteJunk: text("favorite_junk").notNull(),
  xUsername: text("x_username").notNull(),
  evmAddress: text("evm_address").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

const insertSchema = z.object({
  quoteTweet: z.string().min(1),
  favoriteJunk: z.string().min(1),
  xUsername: z.string().min(1),
  evmAddress: z.string().min(1),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "POST") {
    try {
      const data = insertSchema.parse(req.body);
      const [application] = await db.insert(applications).values(data).returning();

      // Send email via Resend
      if (process.env.RESEND_API_KEY) {
        try {
          const resendRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Junkyard <onboarding@resend.dev>",
              to: process.env.NOTIFY_EMAIL || "delivered@resend.dev",
              subject: "New Junkie Application",
              html: `
                <h2>New Application Received</h2>
                <p><strong>X Username:</strong> ${data.xUsername}</p>
                <p><strong>EVM Address:</strong> ${data.evmAddress}</p>
                <p><strong>Quote Tweet:</strong> ${data.quoteTweet}</p>
                <p><strong>Favourite Junk:</strong> ${data.favoriteJunk}</p>
              `,
            }),
          });
          if (!resendRes.ok) {
            console.error("Failed to send email:", await resendRes.text());
          }
        } catch (e) {
          console.error("Error sending email:", e);
        }
      }

      return res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  return res.status(405).end();
}
