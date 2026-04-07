import { StorageInterface } from './index.js';
import { createPost } from '../domain/post.js';

/**
 * Database Storage implementation using Supabase (free tier)
 * This allows for user-specific posts and authentication
 */
export class DBStorage extends StorageInterface {
  constructor(supabaseUrl, supabaseKey) {
    super();
    this.supabaseUrl = supabaseUrl || process.env.SUPABASE_URL;
    this.supabaseKey = supabaseKey || process.env.SUPABASE_KEY;
    
    // Check if we have the required environment variables
    if (!this.supabaseUrl || !this.supabaseKey) {
      console.warn("Supabase URL or Key not provided. DB Storage will not work properly.");
    }
    
    // Dynamically import Supabase client
    this.supabase = null;
    this.initSupabase();
  }
  
  async initSupabase() {
    try {
      // Only initialize if we have the required credentials
      if (this.supabaseUrl && this.supabaseKey) {
        const { createClient } = await import('@supabase/supabase-js');
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
      }
    } catch (error) {
      console.error("Failed to initialize Supabase:", error);
    }
  }

  /**
   * Creates a new post for a specific user
   * @param {string} userId - The ID of the user creating the post
   * @param {Pick<import('../domain/post.js').Post, 'title' | 'contentHtml' | 'contentText'>} postData
   * @returns {Promise<import('../domain/post.js').Post>}
   */
  async createUserPost(userId, postData) {
    if (!this.supabase) {
      throw new Error("Supabase not initialized. Please provide SUPABASE_URL and SUPABASE_KEY.");
    }
    
    // Sanitize HTML content happens inside createPost
    const post = createPost(postData);
    
    const { data, error } = await this.supabase
      .from('posts')
      .insert([{
        id: post.id,
        user_id: userId,
        title: post.title,
        content_html: post.contentHtml,
        content_text: post.contentText,
        created_at: new Date(post.createdAt).toISOString()
      }]);
    
    if (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }
    
    // Return the created post
    return {
      id: post.id,
      title: post.title,
      contentHtml: post.contentHtml,
      contentText: post.contentText,
      createdAt: post.createdAt
    };
  }

  /**
   * Creates a new post (for backward compatibility)
   * @param {Pick<import('../domain/post.js').Post, 'title' | 'contentHtml' | 'contentText'>} postData
   * @returns {Promise<import('../domain/post.js').Post>}
   */
  async createPost(postData) {
    // For backward compatibility, we'll need a default user ID for shared posts
    // In a real implementation, you might want to handle this differently
    return this.createUserPost('_shared_', postData);
  }

  /**
   * Gets a post by ID
   * @param {string} id
   * @returns {Promise<import('../domain/post.js').Post | null>}
   */
  async getPost(id) {
    if (!this.supabase) {
      throw new Error("Supabase not initialized. Please provide SUPABASE_URL and SUPABASE_KEY.");
    }
    
    const { data, error } = await this.supabase
      .from('posts')
      .select('*')
      .eq('id', id')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // Record not found
        return null;
      }
      throw new Error(`Failed to get post: ${error.message}`);
    }
    
    return {
      id: data.id,
      title: data.title,
      contentHtml: data.content_html,
      contentText: data.content_text,
      createdAt: new Date(data.created_at).getTime()
    };
  }

  /**
   * Lists posts for a specific user
   * @param {string} userId
   * @param {number} [limit] Maximum number of posts to return
   * @returns {Promise<Pick<import('../domain/post.js').Post, 'id' | 'title' | 'createdAt'>[]>}
   */
  async listUserPosts(userId, limit = 50) {
    if (!this.supabase) {
      throw new Error("Supabase not initialized. Please provide SUPABASE_URL and SUPABASE_KEY.");
    }
    
    const { data, error } = await this.supabase
      .from('posts')
      .select('id, title, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Failed to list user posts: ${error.message}`);
    }
    
    return data.map(post => ({
      id: post.id,
      title: post.title || '(untitled)',
      createdAt: new Date(post.created_at).getTime()
    }));
  }

  /**
   * Lists all posts (for backward compatibility)
   * @param {number} [limit] Maximum number of posts to return
   * @returns {Promise<Pick<import('../domain/post.js').Post, 'id' | 'title' | 'createdAt'>[]>}
   */
  async listPosts(limit = 50) {
    if (!this.supabase) {
      throw new Error("Supabase not initialized. Please provide SUPABASE_URL and SUPABASE_KEY.");
    }
    
    const { data, error } = await this.supabase
      .from('posts')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Failed to list posts: ${error.message}`);
    }
    
    return data.map(post => ({
      id: post.id,
      title: post.title || '(untitled)',
      createdAt: new Date(post.created_at).getTime()
    }));
  }

  /**
   * Updates an existing post for a specific user
   * @param {string} userId
   * @param {string} id
   * @param {Partial<Pick<import('../domain/post.js').Post, 'title' | 'contentHtml' | 'contentText'>>} postData
   * @returns {Promise<import('../domain/post.js').Post | null>}
   */
  async updateUserPost(userId, id, postData) {
    if (!this.supabase) {
      throw new Error("Supabase not initialized. Please provide SUPABASE_URL and SUPABASE_KEY.");
    }
    
    const { data: existingPost, error: fetchError } = await this.supabase
      .from('posts')
      .select('*')
      .eq('id', id')
      .eq('user_id', userId)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // Record not found
        return null;
      }
      throw new Error(`Failed to fetch post for update: ${fetchError.message}`);
    }
    
    // Merge updated fields with existing post
    const updatedFields = {
      title: postData.title !== undefined ? postData.title : existingPost.title,
      content_html: postData.contentHtml !== undefined ? postData.contentHtml : existingPost.content_html,
      content_text: postData.contentText !== undefined ? postData.contentText : existingPost.content_text,
    };
    
    const { data, error } = await this.supabase
      .from('posts')
      .update(updatedFields)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update post: ${error.message}`);
    }
    
    return {
      id: data.id,
      title: data.title,
      contentHtml: data.content_html,
      contentText: data.content_text,
      createdAt: new Date(data.created_at).getTime()
    };
  }

  /**
   * Updates an existing post (for backward compatibility)
   * @param {string} id
   * @param {Partial<Pick<import('../domain/post.js').Post, 'title' | 'contentHtml' | 'contentText'>>} postData
   * @returns {Promise<import('../domain/post.js').Post | null>}
   */
  async updatePost(id, postData) {
    // For backward compatibility, update in shared space
    return this.updateUserPost('_shared_', id, postData);
  }

  /**
   * Deletes a post by ID for a specific user
   * @param {string} userId
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async deleteUserPost(userId, id) {
    if (!this.supabase) {
      throw new Error("Supabase not initialized. Please provide SUPABASE_URL and SUPABASE_KEY.");
    }
    
    const { error } = await this.supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      throw new Error(`Failed to delete post: ${error.message}`);
    }
    
    return true;
  }

  /**
   * Deletes a post by ID (for backward compatibility)
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async deletePost(id) {
    // For backward compatibility, delete from shared space
    return this.deleteUserPost('_shared_', id);
  }
}