export async function onRequestPost(context) {
    try {
        const body = await context.request.json();

        // LOG the user input
        console.log("Received Listr submission:", body);

        return new Response(JSON.stringify({ status: "ok", received: body }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.toString() }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
