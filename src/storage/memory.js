import { StorageInterface } from './index.js';
import { createPost } from '../domain/post.js';

/**
 * In-memory storage implementation for demo purposes
 * Resets when the serverless function environment does
 */
export class MemoryStorage extends StorageInterface {
  constructor() {
    super();
    // Single shared instance so state persists across invocations on warm lambdas
    if (!MemoryStorage.instance) {
      this.posts = new Map();
      MemoryStorage.instance = this;
    }
    
    return MemoryStorage.instance;
  }

  /**
   * Creates a new post
   * @param {Pick<import('../domain/post.js').Post, 'title' | 'contentHtml' | 'contentText'>} postData
   * @returns {Promise<import('../domain/post.js').Post>}
   */
  async createPost(postData) {
    // Sanitize HTML content happens inside createPost
    const post = createPost(postData);
    this.posts.set(post.id, post);
    return post;
  }

  /**
   * Gets a post by ID
   * @param {string} id
   * @returns {Promise<import('../domain/post.js').Post | null>}
   */
  async getPost(id) {
    if (!id) return null;
    return this.posts.get(id) || null;
  }

  /**
   * Lists posts
   * @param {number} [limit] Maximum number of posts to return
   * @returns {Promise<Pick<import('../domain/post.js').Post, 'id' | 'title' | 'createdAt'>[]>}
   */
  async listPosts(limit = 50) {
    const all = Array.from(this.posts.values());
    all.sort((a, b) => b.createdAt - a.createdAt);
    return all.slice(0, limit).map(p => ({
      id: p.id,
      title: p.title || '(untitled)',
      createdAt: p.createdAt
    }));
  }

  /**
   * Updates an existing post
   * @param {string} id
   * @param {Partial<Pick<import('../domain/post.js').Post, 'title' | 'contentHtml' | 'contentText'>>} postData
   * @returns {Promise<import('../domain/post.js').Post | null>}
   */
  async updatePost(id, postData) {
    const existingPost = this.posts.get(id);
    if (!existingPost) return null;
    
    // Merge updated fields with existing post
    const updatedPost = {
      ...existingPost,
      ...postData,
      id: existingPost.id, // Ensure ID doesn't change
      createdAt: existingPost.createdAt // Preserve creation time
    };
    
    // Apply sanitization if content is being updated
    if (postData.contentHtml) {
      // Sanitization is handled in createPost, but we need to handle updates separately
      // Since createPost is not used for updates, we need to sanitize here
      updatedPost.contentHtml = updatedPost.contentHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      updatedPost.contentHtml = updatedPost.contentHtml.replace(/\s*on\w+\s*=\s*(['"]).*?\1/gi, '');
      updatedPost.contentHtml = updatedPost.contentHtml.replace(/(href|src)\s*=\s*(['"])\s*(javascript:|data:(?!image\/))[^'"]*\2/gi, '');
    }
    
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  /**
   * Deletes a post by ID
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async deletePost(id) {
    return this.posts.delete(id);
  }
}