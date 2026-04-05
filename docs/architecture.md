# Architecture Guide

## Overview

The Telegraph-like Platform follows a modular architecture designed for both temporary trial instances and permanent personal blogs. The system is designed to work on serverless platforms like Netlify and Vercel.

## Storage Architecture

The platform supports multiple storage types through a plugin architecture:

### 1. Shared Demo Instance (`STORAGE_TYPE=memory`)
- **Purpose**: For public demo/trial use
- **Behavior**: All users share the same content space
- **Persistence**: Content remains until the serverless function environment is recycled
- **Best for**: Public demo instances where users don't expect privacy

### 2. User-Isolated Demo Instance (`STORAGE_TYPE=user-isolated`)
- **Purpose**: For private trial use per user/client
- **Behavior**: Content is logically separated per user identifier
- **Persistence**: Same as memory storage, but with logical separation
- **Note**: Still subject to serverless function recycling in public deployments

### 3. Permanent Personal Instance
- **Requirements**: Database-backed storage (Supabase, Neon, etc.)
- **Purpose**: For personal blogs where content must persist
- **Configuration**: Set appropriate environment variables

## Serverless Limitations

### Current Limitations
Serverless functions (Netlify Functions, Vercel API Routes) have inherent limitations:
- No persistent memory between requests
- Function instances are recycled regularly
- State doesn't persist beyond the lifetime of a function container

### Impact on Temporary Instances
True temporary instances with 12-hour expiry cannot be reliably implemented in pure serverless functions because:
1. There's no persistent state between requests
2. We cannot guarantee a cleanup process runs periodically
3. Function containers are recycled unpredictably

### Solutions for True Temporary Instances
To achieve true temporary instances with per-user isolation:

1. **Hybrid Approach**: Combine serverless functions with a scheduled job
   - Use a database for storage
   - Set up a periodic cleanup job (e.g., via cron job or scheduled function)
   - Identify users by IP or temporary tokens

2. **Database with TTL**: Use a database that supports automatic expiration (e.g., Redis with TTL)

## Recommended Setup Options

### Option 1: Public Demo Instance
```
STORAGE_TYPE=memory
```
- Suitable for: Public demo where users share content space
- Pros: Simple, no external dependencies
- Cons: No privacy between users, content disappears unpredictably

### Option 2: Personal/Private Instance with Database
```
STORAGE_TYPE=database
DATABASE_URL=your_database_connection_string
```
- Suitable for: Personal blog or private instance
- Pros: Persistent content, full control
- Cons: Requires database setup

## Deployment Scenarios

### For Trial/Demo Purposes
Use the public demo setup. Understand that:
- Content is shared among all users
- Content is not guaranteed to persist
- Good for evaluating the platform's functionality

### For Personal Blog
1. Set up a database (Supabase, Neon, PostgreSQL, etc.)
2. Configure the platform with database connection
3. Deploy to Netlify/Vercel with environment variables
4. Optionally set up a custom domain

### For Private Trial Instance
For truly private trials, you would need:
1. A dedicated server or container that maintains state
2. Or a serverless setup with database and user identification
3. Scheduled cleanup jobs to remove old content

## Technical Implementation

The platform's architecture separates concerns into:
- Domain layer: Business logic and data validation
- Storage layer: Abstracted storage implementations
- Editor layer: Frontend editing capabilities
- Presentation layer: User interface

This allows for flexible deployment scenarios while maintaining code consistency.