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
    const user = JSON.parse(atob(sessionMatch[1]));
    
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return new Response(JSON.stringify({ user: data ?? null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ user: null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
