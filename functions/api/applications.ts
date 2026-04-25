import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { z } from 'zod';

const applications = pgTable('applications', {
  id: serial('id').primaryKey(),
  quoteTweet: text('quote_tweet').notNull(),
  xUsername: text('x_username').notNull(),
  evmAddress: text('evm_address').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

const schema = z.object({
  quoteTweet: z.string().url(),
  xUsername: z.string().min(1),
  evmAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export async function onRequestPost(context: any) {
  const { env, request } = context;

  if (!env.DATABASE_URL) {
    return new Response(JSON.stringify({ message: 'DATABASE_URL not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const data = schema.parse(body);

    const sql = neon(env.DATABASE_URL);

    const result = await sql.query(
      `INSERT INTO applications (quote_tweet, x_username, evm_address)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.quoteTweet, data.xUsername, data.evmAddress]
    );

    return new Response(JSON.stringify(result.rows[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ message: 'Validation failed', errors: error.errors }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ message: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
