export async function onRequestPost(context) {
    const { params, request, env } = context;
    const listId = params.listId;

    try {
        const body = await request.json();
        const ranked = body.ranked; // array of items
        const timestamp = Date.now();

        if (!Array.isArray(ranked) || ranked.length === 0) {
            return new Response(JSON.stringify({ error: "Invalid ranking" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Load the base list
        const raw = await env.LISTR.get(listId);
        if (!raw) {
            return new Response(JSON.stringify({ error: "List not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Parse list
        const listData = JSON.parse(raw);
        const items = listData.items || [];

        // Validate: ranked must contain all list items
        const missing = items.filter(i => !ranked.includes(i));
        if (missing.length > 0) {
            return new Response(JSON.stringify({ error: "Ranking missing items" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Save submission: store under KV key like "submissions:listId:timestamp"
        const subKey = `submissions:${listId}:${timestamp}`;

        await env.LISTR.put(subKey, JSON.stringify({
            listId,
            timestamp,
            ranked
        }));

        return new Response(JSON.stringify({
            ok: true,
            message: "Ranking submitted",
            listId,
            timestamp
        }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.toString() }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
