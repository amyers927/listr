function generateId() {
    // Simple unique ID for now
    return Math.random().toString(36).slice(2, 10);
}

export async function onRequestPost(context) {
    try {
        const body = await context.request.json();

        if (!body || !Array.isArray(body.items)) {
            return new Response(
                JSON.stringify({ error: "Missing 'items' array in request body" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const listId = generateId();

        // Log the creation (later we can store in KV or DB)
        console.log("Created Listr list:", {
            id: listId,
            items: body.items,
            userAgent: body.userAgent,
            timestamp: body.timestamp,
        });

        // Respond with the new ID + items
        return new Response(
            JSON.stringify({
                id: listId,
                items: body.items,
            }),
            { headers: { "Content-Type": "application/json" } }
        );

    } catch (err) {
        return new Response(JSON.stringify({ error: err.toString() }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
