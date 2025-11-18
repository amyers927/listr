export async function onRequest(context) {
  return new Response(JSON.stringify({
    status: "ok",
    message: "Backend is alive"
  }), {
    headers: { "Content-Type": "application/json" }
  });
}