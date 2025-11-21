export async function onRequestGet(context) {
    try {
        const { id } = context.params;

        // Retrieve from KV
        const stored = await context.env.ListrKV.get(id);

        if (!stored) {
            return new Response(
                JSON.stringify({ error: "List not found" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(stored, {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.toString() }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
