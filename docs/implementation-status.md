# Implementation Status Checklist

This checklist reflects the current state of the **iMovies** project. Each item is marked as **Complete**, **In progress**, **Not implemented**, or **Blocked**.

## Core Backend Features
- [ ] **Authentication & Authorization** (registration, login, logout, JWT, cookies, rate limiting) – *In progress* (basic flow implemented, needs final polish and tests)
- [ ] **User Model** – *Complete* (email, password, role, timestamps)
- [ ] **Movie Catalogue** – *Not implemented*
- [ ] **Wishlist** – *Not implemented*
- [ ] **Cinemas, Screens, Showtimes, Seats** – *Not implemented*
- [ ] **Bookings (concurrency‑safe seat reservation)** – *Not implemented*
- [ ] **Admin Role & RBAC** – *Not implemented*
- [ ] **Centralized Error Handling & Validation** – *Complete* (errorHandler middleware present, basic validation in auth)
- [ ] **Rate Limiting** – *Complete* (rateLimiter middleware present and applied to auth routes)

## Frontend (React) Features
- [ ] **Project scaffold (Vite + React)** – *Not implemented*
- [ ] **Home page, movie discovery, details, showtimes** – *Not implemented*
- [ ] **User authentication pages (register, login)** – *Not implemented*
- [ ] **Wishlist UI** – *Not implemented*
- [ ] **Seat selection UI** – *Not implemented*
- [ ] **Booking flow & confirmation** – *Not implemented*
- [ ] **Admin dashboard** – *Not implemented*
- [ ] **Responsive design adhering to visual guidelines** – *Not implemented*

## Testing
- [ ] **Authentication tests** – *Complete* (existing tests reported passing)
- [ ] **Movie & Wishlist tests** – *Not implemented*
- [ ] **Booking concurrency tests** – *Not implemented*
- [ ] **Admin access tests** – *Not implemented*

## Documentation
- [ ] **README.md** – *In progress* (needs update with setup instructions)
- [ ] **docs/architecture.md** – *Not implemented*
- [ ] **docs/api.md** – *Not implemented*
- [ ] **docs/database.md** – *Not implemented*
- [ ] **docs/design-decisions.md** – *Not implemented*

## Dev / Deployment Setup
- [ ] **.env.example** – *Complete* (present in backend)
- [ ] **.gitignore** – *Complete* (covers env, node_modules, build outputs, logs, etc.)
- [ ] **Seed scripts** – *Not implemented*
- [ ] **CORS & cookie configuration for prod/dev** – *In progress* (basic config present)

---

*This file will be updated continuously as features are implemented.*
