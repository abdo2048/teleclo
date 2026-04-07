/**
 * Authentication service using Supabase Auth
 * Provides user login/logout functionality for personal instances
 */
export class SupabaseAuth {
  constructor(supabaseUrl, supabaseKey) {
    this.supabaseUrl = supabaseUrl || process.env.SUPABASE_URL;
    this.supabaseKey = supabaseKey || process.env.SUPABASE_KEY;
    
    if (!this.supabaseUrl || !this.supabaseKey) {
      console.warn("Supabase URL or Key not provided. Auth will not work properly.");
    }
    
    this.supabase = null;
    this.initSupabase();
  }
  
  async initSupabase() {
    try {
      if (this.supabaseUrl && this.supabaseKey) {
        const { createClient } = await import('@supabase/supabase-js');
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
      }
    } catch (error) {
      console.error("Failed to initialize Supabase:", error);
    }
  }
  
  /**
   * Sign up a new user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} User data or error
   */
  async signUp(email, password) {
    if (!this.supabase) {
      throw new Error("Supabase not initialized. Please provide SUPABASE_URL and SUPABASE_KEY.");
    }
    
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      throw new Error(`Sign up failed: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Sign in an existing user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} User session data or error
   */
  async signIn(email, password) {
    if (!this.supabase) {
      throw new Error("Supabase not initialized. Please provide SUPABASE_URL and SUPABASE_KEY.");
    }
    
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw new Error(`Sign in failed: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  async signOut() {
    if (!this.supabase) {
      throw new Error("Supabase not initialized. Please provide SUPABASE_URL and SUPABASE_KEY.");
    }
    
    const { error } = await this.supabase.auth.signOut();
    
    if (error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }
  
  /**
   * Get the current user session
   * @returns {Promise<Object|null>} Current user session or null if not authenticated
   */
  async getCurrentSession() {
    if (!this.supabase) {
      throw new Error("Supabase not initialized. Please provide SUPABASE_URL and SUPABASE_KEY.");
    }
    
    const { data: { session }, error } = await this.supabase.auth.getSession();
    
    if (error) {
      console.error("Error getting session:", error);
      return null;
    }
    
    return session;
  }
  
  /**
   * Get the current user
   * @returns {Promise<Object|null>} Current user data or null if not authenticated
   */
  async getCurrentUser() {
    if (!this.supabase) {
      throw new Error("Supabase not initialized. Please provide SUPABASE_URL and SUPABASE_KEY.");
    }
    
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();
    
    if (error) {
      console.error("Error getting user:", error);
      return null;
    }
    
    return user;
  }
  
  /**
   * Send a password reset email
   * @param {string} email
   * @returns {Promise<void>}
   */
  async sendPasswordReset(email) {
    if (!this.supabase) {
      throw new Error("Supabase not initialized. Please provide SUPABASE_URL and SUPABASE_KEY.");
    }
    
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      throw new Error(`Password reset failed: ${error.message}`);
    }
  }
  
  /**
   * Subscribe to auth state changes
   * @param {Function} callback - Function to call when auth state changes
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChange(callback) {
    if (!this.supabase) {
      console.error("Supabase not initialized. Please provide SUPABASE_URL and SUPABASE_KEY.");
      return () => {};
    }
    
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(callback);
    
    return () => {
      subscription.unsubscribe();
    };
  }
}