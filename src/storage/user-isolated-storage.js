import { StorageInterface } from './index.js';
import { createPost } from '../domain/post.js';

/**
 * User Isolated Storage implementation
 * This stores posts in a way that can be isolated per user/client
 * Uses a structure like: { userId: { postId: postObject } }
 */
export class UserIsolatedStorage extends StorageInterface {
  constructor() {
    super();
    // Single shared instance so state persists across invocations on warm lambdas
    if (!UserIsolatedStorage.instance) {
      this.userPosts = new Map(); // userId -> Map of posts
      UserIsolatedStorage.instance = this;
    }
    
    return UserIsolatedStorage.instance;
  }

  /**
   * Helper to get or create user storage map
   * @param {string} userId 
   * @returns {Map}
   */
  getUserStorage(userId) {
    if (!this.userPosts.has(userId)) {
      this.userPosts.set(userId, new Map());
    }
    return this.userPosts.get(userId);
  }

  /**
   * Creates a new post for a specific user
   * @param {string} userId - The ID of the user creating the post
   * @param {Pick<import('../domain/post.js').Post, 'title' | 'contentHtml' | 'contentText'>} postData
   * @returns {Promise<import('../domain/post.js').Post>}
   */
  async createUserPost(userId, postData) {
    const userStorage = this.getUserStorage(userId);
    
    // Sanitize HTML content happens inside createPost
    const post = createPost(postData);
    userStorage.set(post.id, post);
    return post;
  }

  /**
   * Creates a new post (shared across all users - for demo purposes)
   * @param {Pick<import('../domain/post.js').Post, 'title' | 'contentHtml' | 'contentText'>} postData
   * @returns {Promise<import('../domain/post.js').Post>}
   */
  async createPost(postData) {
    // For backward compatibility, create a post in a "shared" space
    // This is what the demo instance uses
    return this.createUserPost('_shared_', postData);
  }

  /**
   * Gets a post by ID
   * @param {string} id
   * @returns {Promise<import('../domain/post.js').Post | null>}
   */
  async getPost(id) {
    // Check in shared space first (for backward compatibility)
    let post = this.getPostFromUser('_shared_', id);
    
    // If not found in shared space, we could implement a search across all users
    // But for now, we'll just return from shared space
    return post;
  }

  /**
   * Gets a post by ID for a specific user
   * @param {string} userId
   * @param {string} id
   * @returns {import('../domain/post.js').Post | null}
   */
  getPostFromUser(userId, id) {
    const userStorage = this.getUserStorage(userId);
    return userStorage.get(id) || null;
  }

  /**
   * Lists posts for a specific user
   * @param {string} userId
   * @param {number} [limit] Maximum number of posts to return
   * @returns {Promise<Pick<import('../domain/post.js').Post, 'id' | 'title' | 'createdAt'>[]>}
   */
  async listUserPosts(userId, limit = 50) {
    const userStorage = this.getUserStorage(userId);
    const all = Array.from(userStorage.values());
    all.sort((a, b) => b.createdAt - a.createdAt);
    return all.slice(0, limit).map(p => ({
      id: p.id,
      title: p.title || '(untitled)',
      createdAt: p.createdAt
    }));
  }

  /**
   * Lists all posts (across all users - for demo purposes)
   * @param {number} [limit] Maximum number of posts to return
   * @returns {Promise<Pick<import('../domain/post.js').Post, 'id' | 'title' | 'createdAt'>[]>}
   */
  async listPosts(limit = 50) {
    // For demo purposes, return shared posts
    return this.listUserPosts('_shared_', limit);
  }

  /**
   * Updates an existing post for a specific user
   * @param {string} userId
   * @param {string} id
   * @param {Partial<Pick<import('../domain/post.js').Post, 'title' | 'contentHtml' | 'contentText'>>} postData
   * @returns {Promise<import('../domain/post.js').Post | null>}
   */
  async updateUserPost(userId, id, postData) {
    const userStorage = this.getUserStorage(userId);
    const existingPost = userStorage.get(id);
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
      updatedPost.contentHtml = updatedPost.contentHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      updatedPost.contentHtml = updatedPost.contentHtml.replace(/\s*on\w+\s*=\s*(['"]).*?\1/gi, '');
      updatedPost.contentHtml = updatedPost.contentHtml.replace(/(href|src)\s*=\s*(['"])\s*(javascript:|data:(?!image\/))[^'"]*\2/gi, '');
    }
    
    userStorage.set(id, updatedPost);
    return updatedPost;
  }

  /**
   * Updates an existing post (in shared space - for backward compatibility)
   * @param {string} id
   * @param {Partial<Pick<import('../domain/post.js').Post, 'title' | 'contentHtml' | 'contentText'>>} postData
   * @returns {Promise<import('../domain/post.js').Post | null>}
   */
  async updatePost(id, postData) {
    return this.updateUserPost('_shared_', id, postData);
  }

  /**
   * Deletes a post by ID for a specific user
   * @param {string} userId
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async deleteUserPost(userId, id) {
    const userStorage = this.getUserStorage(userId);
    return userStorage.delete(id);
  }

  /**
   * Deletes a post by ID (from shared space - for backward compatibility)
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async deletePost(id) {
    return this.deleteUserPost('_shared_', id);
  }
}