# Frequently Asked Questions

## 1. About Instance Isolation

### Question: 
"I noticed that posts created on the demo instance are accessible by everyone, regardless of their IP address. I thought the instance would be isolated per user/IP?"

### Answer:
You're correct that this was the intended design, but there are technical limitations with serverless platforms (Netlify Functions/Vercel Serverless Functions) that prevent true per-user isolation in the way initially envisioned.

**Technical Explanation:**
- Serverless functions are stateless - each request is processed independently
- Memory is not preserved between function invocations
- There's no persistent process that could maintain per-user data
- Function containers are recycled frequently

**Current Behavior:**
- All users share the same in-memory storage space
- This is why you see posts created by other users

**For True Isolation:**
To achieve the per-user isolation you described, you would need one of these setups:
1. **Traditional server** with persistent memory and session management
2. **Database-backed solution** with user identification
3. **Hybrid approach** using serverless with a database and scheduled cleanup

## 2. Post Duration in Memory

### Question:
"How long will a post remain in memory?"

### Answer:
In the current serverless deployment:
- Posts remain in memory only as long as the specific function instance remains "warm"
- Once inactive, the function container is recycled (usually within minutes to hours)
- There's no guaranteed duration - it depends on the platform's policies and traffic

For persistent storage, you would need to use a database solution.

## 3. Creating a Permanent Instance

### Question:
"What should I do to create a permanent instance for my personal blog?"

### Answer:
To create a permanent instance for your personal blog:

1. **Choose a Database Solution:**
   - [Supabase](https://supabase.com) (free tier available)
   - [Neon](https://neon.tech) (free tier available)
   - Traditional PostgreSQL/MySQL provider

2. **Configure Environment Variables:**
   ```
   STORAGE_TYPE=database
   DATABASE_URL=your_database_connection_string
   ```

3. **Deploy with Database Connection:**
   - On Netlify: Add environment variables in Site Settings
   - On Vercel: Add environment variables in Project Settings

4. **Optionally Add Authentication:**
   - Use Supabase Auth, Clerk, or similar service
   - Protect your post creation endpoints
   - Add an admin interface to manage your posts

## 4. Implementation Status

### Question:
"Do you see that we made the project like what you described in the spec-kit?"

### Answer:
Yes, we've successfully implemented most of the spec-kit vision:

✅ **Completed:**
- Modular architecture with clear separation of concerns
- Hybrid editor (WYSIWYG + Markdown)
- Privacy-first approach (no tracking)
- Fast loading and performance
- Netlify/Vercel compatibility
- Content sanitization
- Responsive design

⚠️ **Partially Completed (due to serverless limitations):**
- Per-user instance isolation (works theoretically but not in pure serverless)
- 12-hour auto-reset (would require database + scheduled cleanup)

🔧 **Next Steps for Complete Vision:**
1. **Database Integration:** Add database storage adapters
2. **Authentication System:** For personal instances
3. **Enhanced Editor:** More formatting options
4. **Blog Features:** Grouping posts by author
5. **Scheduled Cleanup:** For temporary instances

## Summary

The project successfully implements the core vision of a fast, privacy-respecting telegraph-like platform. The main limitation is the per-user isolation in the serverless demo environment, which is due to inherent serverless platform constraints rather than design flaws.

For your personal use, I recommend setting up a database-backed instance which will provide all the features you originally envisioned.