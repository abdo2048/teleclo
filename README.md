# Warning: This is not a thing to be taken seriously. It's just playing.
# Telegraph-like Platform

A privacy-respecting, fast-loading telegraph-like publishing platform. This is an open-source alternative to telegra.ph that anyone can host with a single click on Netlify, Vercel, or other platforms.

## Features

- **Privacy-first**: No tracking, no analytics, no user data collection
- **Fast loading**: Optimized for speed and performance
- **Easy to host**: One-click deploy to Netlify, Vercel, and others
- **Modular architecture**: Pluggable storage backends
- **Hybrid editor**: WYSIWYG + Markdown editor with real-time preview
- **Internationalization**: Full LTR/RTL support

## Architecture

The project follows a modular architecture with clear separation of concerns:

- **Domain Layer** (`src/domain/`): Business logic and data validation
- **Storage Layer** (`src/storage/`): Pluggable storage implementations
- **Editor Layer** (`src/editor/`): Rich text editor functionality
- **API Layer** (`netlify/functions/`): Serverless functions
- **Presentation Layer** (`public/`): HTML, CSS, and client-side JavaScript

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Netlify CLI (optional, for local development)

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npx netlify dev
   ```
   
3. Visit `http://localhost:8888` in your browser

### Deployment

#### Netlify (Recommended)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-repo/telegraph-like-platform)

#### Vercel

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/telegraph-like-platform)

## Storage Configuration

The platform supports different storage configurations depending on your use case:

### Demo Instance (Shared)
By default, the application uses in-memory storage which shares content among all users. This is suitable for demo purposes:

```env
STORAGE_TYPE=memory
```

### Personal Blog Instance
For a personal blog where you want persistent content, configure a database:

```env
STORAGE_TYPE=database
DATABASE_URL=your_database_connection_string
```

## Understanding Instance Types

Due to the nature of serverless functions (Netlify Functions, Vercel API Routes), true temporary instances with per-user isolation are challenging to implement because:

1. Serverless functions don't maintain persistent state between requests
2. Function instances are recycled unpredictably
3. There's no guaranteed cleanup process

### Available Options

#### Public Demo Instance
- All users share the same content space
- Content persists only as long as the function instance remains "warm"
- Best for trying out the platform functionality

#### Personal/Private Instance (Recommended for actual use)
- Requires a database for persistent content
- Supports proper content ownership and management
- Suitable for personal blogs

See [Architecture Guide](docs/architecture.md) for detailed information about storage options and implementation details.

## Editor Features

The platform includes a hybrid editor that supports both:
- **WYSIWYG editing** for intuitive content creation
- **Markdown editing** for power users
- **Real-time preview** of content
- **CommonMark compliant** parsing

## Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

Check out our [project plan](plan.md) for upcoming features and enhancements:

- Phase 1: Improved storage and architecture
- Phase 2: Better editor and URL improvements
- Phase 3: Blog functionality and views
- Phase 4: Media and fonts support
- Phase 5: Optional account system
- Phase 6: Polish and community features

## Performance & Privacy

- Reader pages under 100KB total
- Fast initial render (<300ms)
- Minimal JavaScript on reader pages
- No analytics by default
- No external dependencies unless optional
- Clear privacy policy

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by telegra.ph
- Built with modern web technologies
- Designed for privacy and performance
