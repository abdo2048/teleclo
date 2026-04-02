// netlify/functions/posts.mjs

// In-memory store: reset randomly when function goes cold.
// Good enough for a testing/demo instance, NOT for production.
const posts = new Map();

// Small helper to create JSON responses
const json = (status, data) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // Basic privacy: disable caching of API responses
      "Cache-Control": "no-store"
    }
  });

// Generate a simple random id
const randomId = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export default async (request, context) => {
  const { method } = request;

  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": request.headers.get("Origin") || "*",
        "Access-Control-Allow-Methods": "GET,POST",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }

  // Simple routing based on query parameters
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (method === "GET") {
    if (id) {
      const post = posts.get(id);
      if (!post) return json(404, { error: "Post not found" });
      return json(200, { id, ...post });
    }

    // List of recent posts (lightweight list, title + createdAt)
    const list = Array.from(posts.entries())
      .map(([pid, post]) => ({
        id: pid,
        title: post.title || "(untitled)",
        createdAt: post.createdAt
      }))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 50);

    return json(200, { posts: list });
  }

  if (method === "POST") {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.content !== "string") {
      return json(400, { error: "Invalid request body" });
    }

    const title =
      typeof body.title === "string" && body.title.trim()
        ? body.title.trim().slice(0, 200)
        : "";

    const id = randomId();
    const createdAt = Date.now();

    const post = {
      title,
      content: body.content.slice(0, 20000), // hard cap for demo
      createdAt
    };

    posts.set(id, post);

    return json(201, {
      id,
      url: `/post.html?id=${encodeURIComponent(id)}`
    });
  }

  return json(405, { error: "Method not allowed" });
};