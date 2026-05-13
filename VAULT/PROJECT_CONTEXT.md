# Project Context & AI Guidelines — VAULT

_Last updated: 2026-05-01_

This document is designed to provide AI agents with a quick, high-level understanding of the `VAULT` project architecture, stack, and current state. Please refer to this document alongside `AGENTS.md`.

---

## 🏗️ 1. Project Architecture & Stack

This project is built using the **Laravel 13** framework, utilizing the `laravel/react-starter-kit` as its foundation. It uses a monolithic SPA (Single Page Application) architecture via Inertia.js, meaning the frontend and backend are tightly integrated within the same repository.

**Backend (Laravel 13 & PHP 8.3/8.4)**
- **Routing & Controllers:** Standard Laravel API and Web routes.
- **Authentication:** Heavy reliance on Laravel's first-party auth ecosystem:
  - **Fortify:** Headless authentication backend (login, registration, 2FA, password resets).
  - **Passport:** OAuth2 API token management and client authentication.
  - **Passkeys:** Biometric/hardware key authentication (`spatie/laravel-passkeys`).
  - **Socialite:** OAuth social logins.
- **Database:** SQLite (default for local dev), utilizing standard Eloquent ORM.

**Frontend (React 19 & Inertia v3)**
- **Framework:** React 19 driven by Inertia.js v3. No separate frontend repository or explicit API fetching via Axios/fetch is necessary for page navigations.
- **Styling:** Tailwind CSS v4.
- **TypeScript & Routing:** **Wayfinder** is deeply integrated (`laravel/wayfinder` & `@laravel/vite-plugin-wayfinder`). All React components should use Wayfinder for generating typed URLs and forms rather than hardcoding endpoints.

**Tooling & Quality Assurance**
- **Testing:** Pest PHP v4 (`pestphp/pest`). All tests must be written using Pest syntax (`test()`, `it()`, `expect()`), not standard PHPUnit classes.
- **Formatting:** Laravel Pint (`laravel/pint`). Run `vendor/bin/pint --format agent` after modifying PHP files.
- **Bundling:** Vite (`vite.config.ts`).

---

## 📂 2. Current Project State

As of the current date, the project is a **freshly scaffolded starter kit** with foundational authentication and OAuth migrations already executed. 

- **Models:** The only existing domain model is `User.php`. It has been configured with OAuth and Passkey traits.
- **Migrations:** Baseline migrations for Users, Cache, Jobs, and OAuth (Passport) are present in `database/migrations/`.
- **Frontend:** Standard React/Inertia pages are located in `resources/js/pages/`, with components in `resources/js/components/`.

There is currently **no custom domain logic** (e.g., custom tables, specific business models, or bespoke UI modules) outside of the authentication boilerplate.

---

## 🤖 3. Core AI Directives

1. **Follow `AGENTS.md`:** The `AGENTS.md` file contains the definitive "Laravel Boost" rules for this project. Always abide by the package versions and strict conventions listed there.
2. **Wayfinder over Hardcoded URLs:** Never hardcode URLs in the React frontend. Use Wayfinder's typed functions to interface with Laravel routes and controllers.
3. **Pest over PHPUnit:** When writing tests, only use Pest. Do not generate standard PHPUnit test classes.
4. **Fortify/Passport Boundaries:** 
   - Use **Fortify** for standard web-based user authentication and profile management.
   - Use **Passport** for issuing API tokens or handling third-party OAuth flows.
5. **No Blind API Creation:** Since the project uses Inertia.js, do not build standard JSON API endpoints for the frontend unless explicitly requested. Return Inertia responses (`Inertia::render()`) from controllers.

---

## 📦 4. Core Dependency Versions

To avoid dependency circles, version conflicts, or incompatible updates, always reference these specific versions:

**Backend (PHP/Laravel)**
- `php`: ^8.3
- `laravel/framework`: ^13.0
- `inertiajs/inertia-laravel`: ^3.0
- `laravel/fortify`: ^1.36
- `laravel/passport`: ^13.0
- `laravel/socialite`: ^5.26
- `laravel/wayfinder`: ^0.1.14
- `spatie/laravel-passkeys`: ^1.7
- `pestphp/pest`: ^4.6 (Testing)

**Frontend (React/Vite/Tailwind)**
- `react` & `react-dom`: ^19.2.0
- `@inertiajs/react`: ^3.0.0
- `tailwindcss`: ^4.0.0
- `vite`: ^8.0.0
- `typescript`: ^5.7.2
- `lucide-react`: ^0.475.0
- `@radix-ui/react-*`: Various versions (always check `package.json` for exact match before adding new primitives)

---

## 🤝 5. Agent Communication Protocol (Backend <-> Frontend)

Since this project uses Inertia.js and a monolithic structure, the Backend Agent (me) and Frontend Agent must work closely together. 

**How the USER can facilitate communication:**

1. **Sequential Handoff:** Have me (the Backend Agent) build the data models, controllers, routes, and business logic *first*. 
2. **Handoff Document:** Once my backend tasks are done, I will update a `HANDOFF.md` file (or provide a detailed summary artifact) containing the Inertia page names, Wayfinder route definitions, and expected props/payloads.
3. **Agent Mentions:** When you call the Frontend Agent, explicitly mention the handoff document: *"Hey Frontend Agent, the backend is ready. Please read HANDOFF.md and implement the UI."*
4. **Git Checkpoints:** I will instruct you to commit my backend changes before the Frontend Agent takes over. This ensures the Frontend Agent works on a clean working tree and has access to the newly generated `laravel/wayfinder` typings.
5. **Wayfinder is the Source of Truth:** The Frontend Agent MUST use `laravel/wayfinder` generated functions to interact with the backend, ensuring perfect sync between backend routes and frontend calls.
