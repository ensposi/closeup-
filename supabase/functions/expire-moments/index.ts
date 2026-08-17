const url = Deno.env.get('SUPABASE_URL')!;
const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const secret = Deno.env.get('FUNCTION_SECRET')!;

Deno.serve(async (req) => {
  if (req.headers.get('x-function-secret') !== secret) {
    return new Response('Unauthorized', { status: 401 });
  }
  const response = await fetch(`${url}/rest/v1/moments?status=in.(open,full,started)&ends_at=lt.${encodeURIComponent(new Date().toISOString())}`, {
    method: 'PATCH',
    headers: { apikey: serviceRole, Authorization: `Bearer ${serviceRole}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ status: 'expired' }),
  });
  return new Response(JSON.stringify({ ok: response.ok }), { status: response.ok ? 200 : 500 });
});
