/**
 * Application Configuration
 * This file contains all configurable options for the application
 */

// Environment-specific configuration
const config = {
  // Storage configuration
  storage: {
    // Type of storage to use ('memory', 'file', 'database', etc.)
    type: process.env.STORAGE_TYPE || 'memory',
    
    // File storage configuration (used when STORAGE_TYPE is 'file')
    file: {
      path: process.env.FILE_STORAGE_PATH || './data',
      extension: process.env.FILE_STORAGE_EXTENSION || '.json'
    },
    
    // Database configuration (used when STORAGE_TYPE is 'database')
    database: {
      connectionString: process.env.DATABASE_URL || '',
      table: process.env.DB_TABLE_NAME || 'posts'
    },
    
    // Memory storage configuration (used when STORAGE_TYPE is 'memory')
    memory: {
      // How long to keep posts in memory (in milliseconds)
      // Set to 0 for unlimited retention (until process restarts)
      ttl: parseInt(process.env.MEMORY_TTL || '43200000'), // 12 hours default
    }
  },
  
  // Security configuration
  security: {
    // Maximum content length allowed
    maxContentLength: parseInt(process.env.MAX_CONTENT_LENGTH || '20000'),
    
    // Maximum title length allowed
    maxTitleLength: parseInt(process.env.MAX_TITLE_LENGTH || '200'),
    
    // Enable/disable content sanitization
    enableSanitization: process.env.ENABLE_SANITIZATION !== 'false'
  },
  
  // Editor configuration
  editor: {
    // Enable markdown preview in addition to editing
    enableMarkdownPreview: process.env.EDITOR_MD_PREVIEW !== 'false',
    
    // Enable WYSIWYG editing
    enableWysiwyg: process.env.EDITOR_WYSIWYG !== 'false',
    
    // Enable CommonMark support
    enableCommonMark: process.env.EDITOR_COMMONMARK !== 'false'
  },
  
  // Feature flags
  features: {
    // Enable temporary instances that expire after TTL
    enableTemporaryInstances: process.env.ENABLE_TEMP_INSTANCES === 'true',
    
    // Time-to-live for temporary instances (in milliseconds)
    tempInstanceTtl: parseInt(process.env.TEMP_INSTANCE_TTL || '43200000'), // 12 hours
    
    // Enable client identification for temporary instances
    enableClientId: process.env.ENABLE_CLIENT_ID !== 'false'
  }
};

// Export the configuration
export default config;

// Also attach to global object for non-module environments
if (typeof window !== 'undefined') {
  window.AppConfig = config;
}