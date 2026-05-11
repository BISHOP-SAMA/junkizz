import { createClient } from '@supabase/supabase-js';

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
    const sessionUser = JSON.parse(atob(sessionMatch[1]));
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', sessionUser.id)
      .single();

    if (error || !user) {
      return new Response(JSON.stringify({ user: null }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ user }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ user: null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
