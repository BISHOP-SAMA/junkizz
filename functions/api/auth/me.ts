import { neon } from '@neondatabase/serverless';

export async function onRequestGet(context: any) {
  const { env, request } = context;
  
  const cookie = request.headers.get('cookie') || '';
  const sessionMatch = cookie.match(/session=([^;]+)/);
  
  if (!sessionMatch) {
    return new Response(JSON.stringify({ user: null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const user = JSON.parse(atob(sessionMatch[1]));
    
    // Get fresh data from DB
    const sql = neon(env.DATABASE_URL);
    const result = await sql`
      SELECT * FROM users WHERE id = ${user.id}
    `;

    return new Response(JSON.stringify({ user: result[0] ?? null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ user: null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}