# TePresto

TePresto is an Ionic + Angular mobile/web application for listing and renting household or shared items within a building or community. It allows users to browse available items, view details, add their own listings, and mark items as rented.

This project is still under active development and currently uses an in-memory Angular signal store instead of a real backend or database.

## Features

- Browse a home feed of available items
- View item details by route parameter
- Mark an item as rented
- Add a new item with photo URL, name, category, price, apartment, owner, and description
- Delete an item from its detail page
- Navigate between home, search, favorites, and profile screens
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
│   │   │   ├── agregar/        # Create-item form
│   │   │   ├── buscar/        # Search screen scaffold
│   │   │   ├── components/    # Reusable UI components
│   │   │   ├── detalle/       # Item detail page
│   │   │   ├── editar/        # Edit screen scaffold
│   │   │   ├── favoritos/     # Favorites screen scaffold
│   │   │   ├── home/          # Main item listing screen
│   │   │   ├── login/         # Login screen scaffold
│   │   │   ├── nuevo/         # Additional creation screen scaffold
│   │   │   ├── perfil/        # Profile screen scaffold
│   │   │   ├── services/      # Item service and in-memory state
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