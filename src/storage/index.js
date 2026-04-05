/**
 * @typedef {import('../domain/post.js').Post} Post
 */

/**
 * Storage interface defining the contract for all storage implementations
 */
export class StorageInterface {
  /**
   * Creates a new post
   * @param {Pick<Post, 'title' | 'contentHtml' | 'contentText'>} postData
   * @returns {Promise<Post>} The created post with ID and timestamp
   */
  async createPost(postData) {
    throw new Error('Method createPost not implemented');
  }

  /**
   * Gets a post by ID
   * @param {string} id
   * @returns {Promise<Post | null>} The post or null if not found
   */
  async getPost(id) {
    throw new Error('Method getPost not implemented');
  }

  /**
   * Lists posts
   * @param {number} [limit] Maximum number of posts to return
   * @returns {Promise<Pick<Post, 'id' | 'title' | 'createdAt'>[]>} List of posts with minimal data
   */
  async listPosts(limit) {
    throw new Error('Method listPosts not implemented');
  }

  /**
   * Updates an existing post
   * @param {string} id
   * @param {Partial<Pick<Post, 'title' | 'contentHtml' | 'contentText'>>} postData
   * @returns {Promise<Post | null>} The updated post or null if not found
   */
  async updatePost(id, postData) {
    throw new Error('Method updatePost not implemented');
  }

  /**
   * Deletes a post by ID
   * @param {string} id
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deletePost(id) {
    throw new Error('Method deletePost not implemented');
  }
}