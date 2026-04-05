/**
 * Temporary Instance Manager
 * Handles client-specific instances with automatic 12-hour cleanup
 */

import { MemoryStorage } from '../storage/memory.js';

export class TempInstanceManager {
  constructor(options = {}) {
    this.instances = new Map(); // Maps client identifiers to storage instances
    this.clientIdentifiers = new Map(); // Maps client identifiers to timestamps
    this.ttl = options.ttl || 12 * 60 * 60 * 1000; // 12 hours in milliseconds
    this.cleanupInterval = options.cleanupInterval || 60 * 60 * 1000; // 1 hour
    
    // Start the cleanup interval
    this.startCleanupTimer();
  }
  
  /**
   * Get or create a storage instance for a specific client
   * @param {string} clientId - Unique identifier for the client
   * @returns {MemoryStorage} The storage instance for this client
   */
  getInstance(clientId) {
    // Check if we already have an instance for this client
    if (!this.instances.has(clientId)) {
      // Create a new storage instance for this client
      const storage = new MemoryStorage();
      this.instances.set(clientId, storage);
      this.clientIdentifiers.set(clientId, Date.now());
    } else {
      // Update the last accessed time
      this.clientIdentifiers.set(clientId, Date.now());
    }
    
    return this.instances.get(clientId);
  }
  
  /**
   * Get client ID from request
   * @param {Request} request - The incoming request
   * @returns {string} Client identifier based on IP, User-Agent, etc.
   */
  getClientIdFromRequest(request) {
    // In a real implementation, we'd extract this from headers, IP, etc.
    // For now, we'll use a combination of headers that might identify a client
    const headers = request.headers;
    
    // Try to get forwarded IP (from proxies/load balancers)
    let ip = headers.get('x-forwarded-for') || 
             headers.get('x-real-ip') || 
             headers.get('x-client-ip') ||
             // In a real serverless function, we'd get this from the context
             'unknown';
    
    // Extract just the first IP if multiple are provided
    if (ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }
    
    // Get user agent
    const userAgent = headers.get('user-agent') || 'unknown';
    
    // Create a simple hash-like identifier
    // Note: This is simplified; in production, you might want a more robust approach
    const combined = `${ip}-${userAgent.substring(0, 50)}`;
    
    // Create a simple hash to anonymize the identifier
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    
    return `client_${Math.abs(hash).toString(36)}`;
  }
  
  /**
   * Start the periodic cleanup timer
   */
  startCleanupTimer() {
    setInterval(() => {
      this.cleanupExpiredInstances();
    }, this.cleanupInterval);
  }
  
  /**
   * Clean up expired instances
   */
  cleanupExpiredInstances() {
    const now = Date.now();
    const expiredClients = [];
    
    for (const [clientId, timestamp] of this.clientIdentifiers.entries()) {
      if (now - timestamp > this.ttl) {
        expiredClients.push(clientId);
      }
    }
    
    // Remove expired clients
    for (const clientId of expiredClients) {
      this.instances.delete(clientId);
      this.clientIdentifiers.delete(clientId);
      console.log(`Cleaned up expired instance for client: ${clientId}`);
    }
    
    if (expiredClients.length > 0) {
      console.log(`Removed ${expiredClients.length} expired client instances`);
    }
  }
  
  /**
   * Get statistics about instances
   * @returns {Object} Statistics about active instances
   */
  getStats() {
    return {
      totalInstances: this.instances.size,
      activeClientIds: Array.from(this.instances.keys()),
      lastCleanup: new Date(Math.max(...Array.from(this.clientIdentifiers.values())))
    };
  }
}

// Singleton instance manager for the application
// In a real serverless environment, this wouldn't persist across requests,
// but it demonstrates the concept
let instanceManager = null;

export function getInstanceManager(options = {}) {
  if (!instanceManager) {
    instanceManager = new TempInstanceManager(options);
  }
  return instanceManager;
}