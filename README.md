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
npm run build        # production build in dist/affectation-ro-ng
npm run serve:ssr    # run the built server, http://localhost:4000
npm test             # unit tests (Vitest)
```

All routes use `RenderMode.Server`. Change it in `app.routes.server.ts` to `Prerender` or `Client` per route.

Add allowed hostnames to `security.allowedHosts` in `angular.json` before deploying.
