export async function onRequestPost(context) {
    const { request, env, params } = context;
    const LIST_ID = params.id;

    if (!LIST_ID) {
        return new Response(JSON.stringify({ error: "Missing listId" }), {
            status: 400
        });
    }

    let body;
    try {
        body = await request.json();
    } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400
        });
    }

    const { ranking, timestamp, userAgent } = body;

    if (!ranking || !Array.isArray(ranking) || ranking.length === 0) {
        return new Response(JSON.stringify({ error: "Ranking must be a non-empty array" }), {
            status: 400
        });
    }

    // Create a submission object
    const submission = {
        submitId: crypto.randomUUID(),
        ranking,
        timestamp: timestamp || Date.now(),
        userAgent: userAgent || "unknown"
    };

    // Key in KV: SUBMISSIONS:listId
    const submissionsKey = `SUBMISSIONS:${LIST_ID}`;

    // Load existing submissions
    let existing = [];
    try {
        const raw = await env.LISTR.get(submissionsKey);
        if (raw) existing = JSON.parse(raw);
    } catch (err) {
        console.error("Failed loading submissions:", err);
    }

    // Add the new submission
    existing.push(submission);

    // Save back to KV
    try {
        await env.LISTR.put(submissionsKey, JSON.stringify(existing));
    } catch (err) {
        console.error("Failed saving submission:", err);
        return new Response(JSON.stringify({ error: "Failed to save submission" }), {
            status: 500
        });
    }

    // Return submitId to front-end
    return new Response(
        JSON.stringify({ ok: true, submitId: submission.submitId }),
        {
            status: 200,
            headers: { "Content-Type": "application/json" }
        }
    );
}
