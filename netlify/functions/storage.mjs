// netlify/functions/storage.mjs

/**
 * Post shape:
 * { id, title, content, createdAt }
 *
 * Storage interface:
 * - createPost({ title, content }) -> post
 * - getPost(id) -> post | null
 * - listPosts(limit?) -> [{ id, title, createdAt }]
 *
 * This file is the only place that knows how posts are stored.
 * For now it's in-memory; later we can add other adapters.
 */


const clampString = (value, max) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
};

class MemoryStorage {
  constructor() {
    this.posts = new Map();
  }

  _newId() {
    return (
      Math.random().toString(36).slice(2, 10) +
      Date.now().toString(36)
    );
  }

  createPost({ title, contentHtml, contentText }) {
    const id = this._newId();
    const createdAt = Date.now();

    const safeTitle = clampString(title, 200);
    const safeHtml = clampString(contentHtml, 20000);
    const safeText = clampString(contentText, 20000);

    const post = {
      id,
      title: safeTitle,
      contentHtml: safeHtml,
      contentText: safeText,
      createdAt
    };

    this.posts.set(id, post);
    return post;
  }

  getPost(id) {
    if (!id) return null;
    return this.posts.get(id) || null;
  }

  listPosts(limit = 50) {
    const all = Array.from(this.posts.values());
    all.sort((a, b) => b.createdAt - a.createdAt);
    return all.slice(0, limit).map((p) => ({
      id: p.id,
      title: p.title || "(untitled)",
      createdAt: p.createdAt
    }));
  }
}

export const storage = new MemoryStorage();

// Single shared instance so state persists across invocations on warm lambdas
export const storage = new MemoryStorage();