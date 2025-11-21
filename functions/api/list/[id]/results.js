export async function onRequestGet(context) {
    const { request, env, params } = context;
    const listId = params.id;

    const LIST_KEY = `LIST:${listId}`;
    const LIST = await env.LISTR.get(LIST_KEY, { type: "json" });

    if (!LIST) {
        return new Response(JSON.stringify({ error: "List not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" }
        });
    }

    const allItems = LIST.items || [];

    // ------------------------------------------------------------
    // Load ALL submissions for this list
    // ------------------------------------------------------------
    const prefix = `SUBMIT:${listId}:`;
    const submissions = [];

    const { keys } = await env.LISTR.list({ prefix });

    for (const k of keys) {
        const sub = await env.LISTR.get(k.name, { type: "json" });
        if (sub && Array.isArray(sub.ranked)) {
            submissions.push(sub);
        }
    }

    // If no one submitted yet
    if (submissions.length === 0) {
        return new Response(JSON.stringify({
            final: allItems.map(item => ({ item, score: 0 })),
            message: "No submissions yet"
        }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    // ------------------------------------------------------------
    // SCORING — BORDA COUNT
    // ------------------------------------------------------------
    const scores = {};
    for (const item of allItems) scores[item] = 0;

    for (const sub of submissions) {
        const r = sub.ranked;
        const N = r.length;

        // Highest ranked gets the largest score
        for (let i = 0; i < r.length; i++) {
            const item = r[i];
            const points = N - i;
            if (scores[item] !== undefined) {
                scores[item] += points;
            }
        }
    }

    // ------------------------------------------------------------
    // Sort by score descending
    // ------------------------------------------------------------
    const final = [...allItems]
        .map(item => ({
            item,
            score: scores[item] || 0
        }))
        .sort((a, b) => b.score - a.score);

    return new Response(JSON.stringify({ final }, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
}
