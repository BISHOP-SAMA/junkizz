import { neon } from '@neondatabase/serverless';
import { z } from 'zod';

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

    const result = await sql`
      INSERT INTO applications (quote_tweet, x_username, evm_address)
      VALUES (${data.quoteTweet}, ${data.xUsername}, ${data.evmAddress})
      RETURNING *
    `;

    return new Response(JSON.stringify(result[0] ?? { success: true }), {
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
