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

  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/site_state?id=eq.true`, {
    method: 'PATCH',
    headers: {
      apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) return json({ error: result?.message || 'Database update failed' }, 500);
  return json({ data: result?.[0] });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
