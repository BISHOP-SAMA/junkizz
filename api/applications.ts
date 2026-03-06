import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import pg from "pg";
import { Resend } from "resend";
import { z } from "zod";

const { Pool } = pg;

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
  if (req.method !== "POST") return res.status(405).end();

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  const resend = new Resend("re_6uprATPJ_4uUyhgwEYcPgZkZzLH2EiJzv");

  try {
    const data = insertSchema.parse(req.body);
    const [application] = await db.insert(applications).values(data).returning();

    await resend.emails.send({
      from: "Junkyard <onboarding@resend.dev>",
      to: "backyardjunkieseth@gmail.com",
      subject: "New Junkie Application",
      html: `
        <h2>New Application Received</h2>
        <p><strong>X Username:</strong> ${data.xUsername}</p>
        <p><strong>EVM Address:</strong> ${data.evmAddress}</p>
        <p><strong>Quote Tweet:</strong> ${data.quoteTweet}</p>
        <p><strong>Favourite Junk:</strong> ${data.favoriteJunk}</p>
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
