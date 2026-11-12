# Angular SSR POC

Minimal Angular 22 application with server-side rendering (Express + `@angular/ssr`), Vitest and SCSS.

## Structure

```
src/
├── app/
│   ├── config/app.config.ts               # browser providers (router, hydration)
│   ├── routes/app.routes.ts               # lazy-loaded routes
│   ├── server/config/app.config.server.ts # server providers
│   ├── server/routes/app.routes.server.ts # render mode per route
│   └── pages/home/                        # example page
├── styles/                                # base, theme, mixins (screen mixin)
├── main.ts                                # browser entry
├── main.server.ts                         # server bootstrap
└── server.ts                              # Express server
```

## Commands

```bash
npm install
npm start            # dev server with SSR, http://localhost:4200
npm run build        # production build in dist/angular-ssr-poc
npm run serve:ssr    # run the built server, http://localhost:4000
npm test             # unit tests (Vitest)
```

All routes use `RenderMode.Server`. Change it in `app.routes.server.ts` to `Prerender` or `Client` per route.

Add allowed hostnames to `security.allowedHosts` in `angular.json` before deploying.
