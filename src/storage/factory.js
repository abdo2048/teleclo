import { MemoryStorage } from './memory.js';
import { UserIsolatedStorage } from './user-isolated-storage.js';

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
    
    // Additional cases would be added for other storage types:
    // case 'file':
    //   return new FileStorage(process.env.FILE_STORAGE_PATH || './data');
    // 
    // case 'database':
    //   return new DatabaseStorage({
    //     connectionString: process.env.DATABASE_URL
    //   });
    
    default:
      console.warn(`Unknown storage type: ${storageType}, falling back to memory storage`);
      return new MemoryStorage();
  }
}

// Export for direct use when needed
export { MemoryStorage } from './memory.js';
export { UserIsolatedStorage } from './user-isolated-storage.js';