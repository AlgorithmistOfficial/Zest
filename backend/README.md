# Backend Structure

This backend now exposes a `server.js` entrypoint and a `src/` layout scaffold for future separation of config, controllers, middleware, models, routes, services, utils, and validators.

Current runtime behavior is still backed by the existing application logic in `index.js` so the server keeps working while the codebase is migrated into `src/` over time.
