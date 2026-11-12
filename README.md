# Affectation RO

Step-by-step solver for the assignment problem (Hungarian method, min and max), built with Angular 22, server-side rendering (Express + `@angular/ssr`), Vitest and SCSS.

## Structure

```
src/
├── app/
│   ├── config/app.config.ts               # browser providers (router, hydration)
│   ├── routes/app.routes.ts               # lazy-loaded routes
│   ├── server/config/app.config.server.ts # server providers
│   ├── server/routes/app.routes.server.ts # render mode per route
│   ├── core/assignment/                   # solver, matrix utils, import/export
│   ├── components/                        # inputs, matrix tables, steps, graph
│   └── pages/affectation/                 # page state (signal form, reveal)
├── styles/                                # base, theme, mixins (screen mixin)
├── main.ts                                # browser entry
├── main.server.ts                         # server bootstrap
└── server.ts                              # Express server
```

## Commands

```bash
npm install
npm start            # dev server with SSR, http://localhost:4200
npm run build        # static prerendered build in dist/affectation-ro-ng/browser
npm run serve:static # preview the production build locally
npm test             # unit tests (Vitest)
```

## Deployment (Netlify)

The production build is static (`outputMode: "static"`, every route uses `RenderMode.Prerender`).
`netlify.toml` runs `npm run build` and publishes `dist/affectation-ro-ng/browser`.

`src/server.ts` uses the Netlify App Engine handler from `@netlify/angular-runtime`; it is only used by the dev server and at build time.

To use a custom domain, add it to `security.allowedHosts` in `angular.json` and to `allowedHosts` in `src/server.ts`.
