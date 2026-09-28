# TePresto

TePresto is an Ionic + Angular mobile/web application for listing and renting household or shared items within a building or community. It allows users to browse available items, search and favorite them, log in, manage their own listings, and mark items as rented.

This project is still under active development. Data and authentication live in [Supabase](https://supabase.com): Postgres tables protected by Row Level Security (each user only sees their own building), Supabase Auth for accounts (email + password, with email confirmation), and Realtime so new items, posts, messages and loan updates appear without reloading. The rental rules (dates, owners, states) run as database functions.

## Features

- Community wall (Inicio → Muro): post Busco / Ofrezco / Aviso, every new product is also posted there, filter by post type, public comments on each post, and "Contactar" / "Yo te presto" to open a private chat with the author
- Browse the product grid of your building (Inicio → Productos)
- Search items by name, category, or description, plus wall posts by text or author
- Mark items as favorites (saved per user) and view them in a dedicated screen
- View item details by route parameter
- Request to rent an item for a date range; the owner accepts or rejects it and later marks it as returned (each step is also sent to both people's chat)
- "Mis préstamos" screen (from Perfil) with what you asked for and what you lend, plus a badge for requests waiting for your answer
- Sign up and log in with a real account (Supabase Auth); accounts without a building are sent to a "complete profile" screen to enter the building code
- Add a new item, automatically attributed to the logged-in user
- Edit or delete an item, restricted to its owner only
- View and edit your own profile (name, apartment, photo) and see your own published items
- Chat with the owner of an item from its detail page; a Chats tab lists your conversations with an unread-messages badge
- Register with a building access code; each user only sees the items of their own community (building)
- Route guards that redirect unauthenticated users to the login screen (every route except login and registration)
- Navigate between home, search, favorites, and profile screens via a single global tab bar
- Build as a web app and prepare for Capacitor native integration

## Tech stack

- Angular 22
- Ionic Angular 9
- Angular Router
- TypeScript
- Supabase (Postgres + RLS, Auth, Realtime) via `@supabase/supabase-js`
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
│   │   │   ├── chat/          # Single conversation screen
│   │   │   ├── chats/         # Chats inbox
│   │   │   ├── components/    # Reusable UI components (item card, wall post card, rental panel)
│   │   │   ├── detalle/       # Item detail page (edit/delete shown to owner only)
│   │   │   ├── editar/        # Edit screen scaffold
│   │   │   ├── favoritos/     # Favorites screen
│   │   │   ├── guards/        # Route guards (auth guard)
│   │   │   ├── home/          # Main item listing screen
│   │   │   ├── login/         # Login screen (Supabase Auth)
│   │   │   ├── completar-perfil/ # Join a building with its code
│   │   │   ├── nuevo/         # Additional creation screen scaffold
│   │   │   ├── perfil/        # Profile screen (view/edit own data, own listings)
│   │   │   ├── prestamos/     # My loans: requested and lent items
│   │   │   ├── post/          # Wall post with its public comments
│   │   │   ├── services/      # Supabase client + auth, items, chat, wall and loan services
│   │   │   ├── utils/         # Small helpers (dates, relative time, clearing inputs)
│   │   │   ├── app.routes.ts  # Route definitions
│   │   │   ├── app.component.ts
│   │   │   └── app.component.html
│   │   ├── assets/
│   │   ├── environments/     # Supabase URL and publishable key
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
