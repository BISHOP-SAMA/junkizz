export async function onRequestGet(context: any) {
  const { env } = context;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env.TWITTER_CLIENT_ID,
    redirect_uri: 'https://planetslog.xyz/api/auth/callback',
    scope: 'tweet.read users.read offline.access',
    state: crypto.randomUUID(),
    code_challenge: 'challenge',
    code_challenge_method: 'plain',
  });

  return Response.redirect(
    `https://twitter.com/i/oauth2/authorize?${params}`,
    302
  );
}
