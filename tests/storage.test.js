import { MemoryStorage } from '../src/storage/memory.js';

async function runTests() {
  console.log('Running storage tests...\n');
  
  const storage = new MemoryStorage();
  
  // Test 1: Create a post
  try {
    const testData = {
      title: 'Test Post',
      contentHtml: '<p>This is a test post</p>',
      contentText: 'This is a test post'
    };
    
    const post = await storage.createPost(testData);
    
    if (!post.id) {
      throw new Error('Post should have an ID');
    }
    
    if (post.title !== testData.title) {
      throw new Error(`Expected title "${testData.title}", got "${post.title}"`);
    }
    
    console.log('✓ Test 1 passed: Create post');
  } catch (error) {
    console.error('✗ Test 1 failed:', error.message);
    return false;
  }
  
  // Test 2: Get a post
  try {
    const testData = {
      title: 'Second Test Post',
      contentHtml: '<p>Another test post</p>',
      contentText: 'Another test post'
    };
    
    const post = await storage.createPost(testData);
    const retrievedPost = await storage.getPost(post.id);
    
    if (!retrievedPost) {
      throw new Error('Should have retrieved the post');
    }
    
    if (retrievedPost.id !== post.id) {
      throw new Error('Retrieved post should have same ID');
    }
    
    console.log('✓ Test 2 passed: Get post');
  } catch (error) {
    console.error('✗ Test 2 failed:', error.message);
    return false;
  }
  
  // Test 3: List posts
  try {
    const posts = await storage.listPosts();
    
    if (!Array.isArray(posts)) {
      throw new Error('List posts should return an array');
    }
    
    if (posts.length === 0) {
      throw new Error('Should have at least 2 posts by now');
    }
    
    // Check that each post has required properties
    for (const post of posts) {
      if (!post.id || !post.title || !post.createdAt) {
        throw new Error('Post should have id, title, and createdAt');
      }
    }
    
    console.log('✓ Test 3 passed: List posts');
  } catch (error) {
    console.error('✗ Test 3 failed:', error.message);
    return false;
  }
  
  // Test 4: Update post
  try {
    const testData = {
      title: 'Original Title',
      contentHtml: '<p>Original content</p>',
      contentText: 'Original content'
    };
    
    const post = await storage.createPost(testData);
    const updatedTitle = 'Updated Title';
    
    const updatedPost = await storage.updatePost(post.id, {
      title: updatedTitle
    });
    
    if (!updatedPost) {
      throw new Error('Update should return the updated post');
    }
    
    if (updatedPost.title !== updatedTitle) {
      throw new Error(`Expected updated title "${updatedTitle}", got "${updatedPost.title}"`);
    }
    
    if (updatedPost.id !== post.id) {
      throw new Error('Updated post should have the same ID');
    }
    
    if (updatedPost.createdAt !== post.createdAt) {
      throw new Error('Updated post should have the same creation time');
    }
    
    console.log('✓ Test 4 passed: Update post');
  } catch (error) {
    console.error('✗ Test 4 failed:', error.message);
    return false;
  }
  
  // Test 5: Delete post
  try {
    const testData = {
      title: 'To Be Deleted',
      contentHtml: '<p>To be deleted</p>',
      contentText: 'To be deleted'
    };
    
    const post = await storage.createPost(testData);
    const deleted = await storage.deletePost(post.id);
    
    if (!deleted) {
      throw new Error('Delete should return true when successful');
    }
    
    const retrievedPost = await storage.getPost(post.id);
    if (retrievedPost) {
      throw new Error('Should not be able to retrieve deleted post');
    }
    
    console.log('✓ Test 5 passed: Delete post');
  } catch (error) {
    console.error('✗ Test 5 failed:', error.message);
    return false;
  }
  
  // Test 6: XSS protection
  try {
    const maliciousData = {
      title: 'Test<script>alert("xss")</script>',
      contentHtml: '<p onclick="alert(\'xss\')">Content<script>alert("xss")</script></p>',
      contentText: 'Safe text content'
    };
    
    const post = await storage.createPost(maliciousData);
    
    // Check that script tags are removed
    if (post.contentHtml.includes('<script>')) {
      throw new Error('Script tags should be removed from content');
    }
    
    // Check that event handlers are removed
    if (post.contentHtml.toLowerCase().includes('onclick=')) {
      throw new Error('Event handlers should be removed from content');
    }
    
    // Title should be stripped of HTML
    if (post.title.includes('<script>')) {
      throw new Error('Script tags should be removed from title');
    }
    
    console.log('✓ Test 6 passed: XSS protection');
  } catch (error) {
    console.error('✗ Test 6 failed:', error.message);
    return false;
  }
  
  console.log('\n✓ All tests passed!');
  return true;
}

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runTests()
    .then(success => {
      console.log("\nTest execution completed.");
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

export { runTests };