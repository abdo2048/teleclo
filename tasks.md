# Telecot – Tasks (Near Term)

## Phase 1 – Storage & Architecture

- [ ] Introduce `src/` structure:
      - `src/domain/post.ts`
      - `src/storage/memory.ts`
      - `src/storage/index.ts` (factory)
      - `netlify/functions/posts.ts` -> use storage interface
- [ ] Add minimal TypeScript support (or keep JS but define JSDoc types).
- [ ] Add a configuration mechanism (env var) to choose storage adapter.
- [ ] Add basic unit tests for `memory` storage.
- [ ] Document the architecture in README (text-first, privacy-first, Netlify focused).