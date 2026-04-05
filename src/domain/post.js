/**
 * @typedef {Object} Post
 * @property {string} id - Unique identifier for the post
 * @property {string} title - Title of the post
 * @property {string} contentHtml - HTML content of the post
 * @property {string} contentText - Plain text content of the post
 * @property {number} createdAt - Timestamp of creation
 */

/**
 * Validates a post object
 * @param {Partial<Post>} post
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validatePost(post) {
  const errors = [];
  
  if (post.title && typeof post.title !== 'string') {
    errors.push('Title must be a string');
  }
  
  if (post.contentHtml && typeof post.contentHtml !== 'string') {
    errors.push('ContentHtml must be a string');
  }
  
  if (post.contentText && typeof post.contentText !== 'string') {
    errors.push('ContentText must be a string');
  }
  
  if (post.title && post.title.length > 200) {
    errors.push('Title must be 200 characters or less');
  }
  
  if (post.contentHtml && post.contentHtml.length > 20000) {
    errors.push('Content must be 20000 characters or less');
  }
  
  if (post.contentText && post.contentText.length > 20000) {
    errors.push('Content text must be 20000 characters or less');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Creates a new post object
 * @param {Pick<Post, 'title' | 'contentHtml' | 'contentText'>} postData
 * @returns {Post}
 */
export function createPost(postData) {
  const { title = '', contentHtml = '', contentText = '' } = postData;
  
  const validation = validatePost({ title, contentHtml, contentText });
  
  if (!validation.valid) {
    throw new Error(`Invalid post data: ${validation.errors.join(', ')}`);
  }
  
  return {
    id: generateId(),
    title: title.trim(),
    contentHtml: contentHtml.trim(),
    contentText: contentText.trim(),
    createdAt: Date.now()
  };
}

/**
 * Generates a unique ID for a post
 * @returns {string}
 */
function generateId() {
  return (
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36)
  );
}

