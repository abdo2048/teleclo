import { MemoryStorage } from './memory.js';
import { UserIsolatedStorage } from './user-isolated-storage.js';
import { DBStorage } from './db-storage.js';

/**
 * Creates and returns the appropriate storage instance based on environment/config
 * @returns {import('./index.js').StorageInterface}
 */
export function createStorage() {
  // Determine storage type based on environment variables
  const storageType = process.env.STORAGE_TYPE || 'memory'; // Default to memory for demo
  
  switch (storageType) {
    case 'memory':
      return new MemoryStorage();
    
    case 'user-isolated':
      return new UserIsolatedStorage();
    
    case 'database':
    case 'db':
      // For DB storage, we need Supabase credentials
      return new DBStorage(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY
      );
    
    // Additional cases would be added for other storage types:
    // case 'file':
    //   return new FileStorage(process.env.FILE_STORAGE_PATH || './data');
    
    default:
      console.warn(`Unknown storage type: ${storageType}, falling back to memory storage`);
      return new MemoryStorage();
  }
}

// Export for direct use when needed
export { MemoryStorage } from './memory.js';
export { UserIsolatedStorage } from './user-isolated-storage.js';
export { DBStorage } from './db-storage.js';