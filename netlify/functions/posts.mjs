// netlify/functions/posts.mjs
import { createStorage } from '../../src/storage/factory.js';

// With serverless functions, we can't maintain state between requests
// So for the demo instance, we'll use a single shared storage
const storage = createStorage();

const json = (status, data) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });

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

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (method === "GET") {
    if (id) {
      const post = await storage.getPost(id);
      if (!post) return json(404, { error: "Post not found" });

      return json(200, {
        id: post.id,
        title: post.title,
        contentHtml: post.contentHtml,
        contentText: post.contentText,
        createdAt: post.createdAt
      });
    }

    const posts = await storage.listPosts(50);
    return json(200, { posts });
  }

  if (method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch {
      return json(400, { error: "Invalid JSON" });
    }

    const html = typeof body.contentHtml === "string" ? body.contentHtml : "";
    const text = typeof body.contentText === "string" ? body.contentText : "";

    if (!html.trim() && !text.trim()) {
      return json(400, { error: "Content is required" });
    }

    try {
      const post = await storage.createPost({
        title: body.title,
        contentHtml: html,
        contentText: text
      });

      return json(201, {
        id: post.id,
        url: `/post.html?id=${encodeURIComponent(post.id)}`
      });
    } catch (error) {
      return json(400, { error: error.message });
    }
  }

  return json(405, { error: "Method not allowed" });
};