export async function onRequestGet() {
  return new Response(null, {
    status: 302,
    headers: {
      'Location': 'https://planetslog.xyz',
      'Set-Cookie': 'session=; Path=/; HttpOnly; Secure; Max-Age=0',
    },
  });
}