import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const schema = z.object({
  quoteTweet: z.string().url(),
  xUsername: z.string().min(1),
  evmAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export async function onRequestPost(context: any) {
  const { env, request } = context;

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ message: 'Supabase not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const data = schema.parse(body);

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: result, error } = await supabase
      .from('applications')
      .insert({
        quote_tweet: data.quoteTweet,
        x_username: data.xUsername,
        evm_address: data.evmAddress,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return new Response(JSON.stringify(result ?? { success: true }), {
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
