import { neon } from '@neondatabase/serverless';

export async function onRequestGet(context: any) {
  const { env, request } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return Response.redirect('https://planetslog.xyz?error=no_code', 302);
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${env.TWITTER_CLIENT_ID}:${env.TWITTER_CLIENT_SECRET}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'https://planetslog.xyz/api/auth/callback',
        code_verifier: 'challenge',
      }),
    });

    const tokens = await tokenRes.json() as any;

    if (!tokens.access_token) {
      return Response.redirect('https://planetslog.xyz?error=no_token', 302);
    }

    // Get user info
    const userRes = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` },
    });

    const { data: twitterUser } = await userRes.json() as any;

    // Save to DB
    const sql = neon(env.DATABASE_URL);
    const result = await sql`
      INSERT INTO users (twitter_id, twitter_handle, twitter_avatar)
      VALUES (${twitterUser.id}, ${twitterUser.username}, ${twitterUser.profile_image_url})
      ON CONFLICT (twitter_id) 
      DO UPDATE SET twitter_handle = ${twitterUser.username}, twitter_avatar = ${twitterUser.profile_image_url}
      RETURNING *
    `;

    const user = result[0];

    // Set session cookie
    const session = btoa(JSON.stringify({
      id: user.id,
      twitter_id: user.twitter_id,
      twitter_handle: user.twitter_handle,
      twitter_avatar: user.twitter_avatar,
      shells_balance: user.shells_balance,
    }));

    return new Response(null, {
      status: 302,
      headers: {
        'Location': 'https://planetslog.xyz/game',
        'Set-Cookie': `session=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return Response.redirect(`https://planetslog.xyz?error=${encodeURIComponent(msg)}`, 302);
  }
}