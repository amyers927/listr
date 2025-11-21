function generateId() {
    return Math.random().toString(36).slice(2, 10);
}

export async function onRequestPost(context) {
    try {
        const body = await context.request.json();

        if (!body || !Array.isArray(body.items)) {
            return new Response(
                JSON.stringify({ error: "Missing 'items' array" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const id = generateId();
        const record = {
            id,
            items: body.items,
            createdAt: Date.now(),
        };

        // 🧠 Save to KV
        await context.env.ListrKV.put(id, JSON.stringify(record));

        console.log("Saved list to KV:", id);

        return new Response(
            JSON.stringify({ id, items: body.items }),
            { headers: { "Content-Type": "application/json" } }
        );

    } catch (err) {
        return new Response(JSON.stringify({ error: err.toString() }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
