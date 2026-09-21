import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const body = await request.json().catch(() => null);
  if (!body || body.passcode !== Deno.env.get('ADMIN_PASSCODE')) {
    return json({ error: 'Invalid passcode' }, 401);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const updates: Record<string, boolean | string | null> = {};
  if (body.action === 'maintenance') {
    updates.maintenance_enabled = Boolean(body.enabled);
  } else if (body.action === 'countdown') {
    updates.countdown_name = String(body.name || '').trim() || null;
    updates.countdown_ends_at = body.endsAt || null;
  } else if (body.action === 'announcement') {
    updates.announcement = String(body.message || '').trim() || null;
  } else {
    return json({ error: 'Unknown action' }, 400);
  }

  const { data, error } = await supabase
    .from('site_state')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', true)
    .select()
    .single();

  if (error) return json({ error: error.message }, 500);
  return json({ data });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
