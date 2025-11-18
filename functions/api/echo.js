export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const msg = url.searchParams.get("msg") || "no message provided";

  return new Response(JSON.stringify({
    ok: true,
    echoed: msg
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
