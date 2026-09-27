# TePresto

TePresto is an Ionic + Angular mobile/web application for listing and renting household or shared items within a building or community. It allows users to browse available items, search and favorite them, log in, manage their own listings, and mark items as rented.

This project is still under active development and currently uses an in-memory Angular signal store instead of a real backend or database. Authentication is simulated client-side with a hardcoded list of users (no real tokens or persistence across page reloads).

## Features

- Browse a home feed of available items, filterable by status
- Search items by name, category, or description
- Mark items as favorites and view them in a dedicated screen
- View item details by route parameter
- Mark an item as rented
- Log in with a simulated user account (email/password)
- Add a new item, automatically attributed to the logged-in user
- Edit or delete an item, restricted to its owner only
- View and edit your own profile (name, apartment, photo) and see your own published items
- Route guards that redirect unauthenticated users to the login screen for protected routes (add item, edit item, favorites, profile)
- Navigate between home, search, favorites, and profile screens via a single global tab bar
- Build as a web app and prepare for Capacitor native integration

## Tech stack

- Angular 22
- Ionic Angular 9
- Angular Router
- TypeScript
- SCSS
- Vitest / JSDOM
- Capacitor 8

## Repository structure

```text
.
├── tepresto1/                  # Main Angular/Ionic application
│   ├── src/
│   │   ├── app/
│   │   │   ├── agregar/        # Create-item form (owner assigned from logged-in user)
│   │   │   ├── buscar/        # Search screen
│   │   │   ├── components/    # Reusable UI components (e.g. item card)
│   │   │   ├── detalle/       # Item detail page (edit/delete shown to owner only)
│   │   │   ├── editar/        # Edit screen scaffold
│   │   │   ├── favoritos/     # Favorites screen
│   │   │   ├── guards/        # Route guards (auth guard)
│   │   │   ├── home/          # Main item listing screen
│   │   │   ├── login/         # Login screen (simulated auth)
│   │   │   ├── nuevo/         # Additional creation screen scaffold
│   │   │   ├── perfil/        # Profile screen (view/edit own data, own listings)
│   │   │   ├── services/      # Item service, auth service, and in-memory state
│   │   │   ├── app.routes.ts  # Route definitions
│   │   │   ├── app.component.ts
│   │   │   └── app.component.html
│   │   ├── assets/
│   │   ├── environments/
│   │   ├── main.ts
│   │   ├── global.scss
│   │   └── theme/
│   ├── angular.json
│   ├── capacitor.config.ts
│   ├── ionic.config.json
│   ├── package.json
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.spec.json
│   └── package-lock.json
├── README.md
└── .gitignore
