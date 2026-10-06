# Zidaan Architectures — Real-Estate Platform

Website, client accounts and staff back office for an Indian real-estate and
architecture studio. Visitors browse listings and request viewings; agents
handle those viewings and log deals; the office manages listings, staff,
enquiries and the sales ledger.

| App | Folder | Who uses it | Dev URL |
|---|---|---|---|
| Public website + client accounts | `frontend-user` | Visitors, registered clients | http://localhost:5174 |
| Staff dashboard | `frontend-dashboard` | Admins, managers, agents | http://localhost:5173 |
| REST API | `backend` | Both frontends | http://127.0.0.1:8000/api |

- **Deploying to a server:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Handing over / day-to-day operation:** [HANDOVER.md](HANDOVER.md)

---

## What it does

**Public website** — home page with featured listings, catalogue with filters
(buy / rent, 6 property types, price, bedrooms, city), listing pages with
gallery and viewing request, agent directory and profiles, Sell-your-property
valuation form, Contact form, journal, team, services, legal pages.

**Client account** (register with email *or* phone) — request and cancel
viewings, saved listings, profile and password, in-app notifications,
password reset by emailed 6-digit code.

**Staff dashboard**

| Feature | Admin | Manager | Agent |
|---|:-:|:-:|:-:|
| KPIs and revenue / listings charts | all data | all data | own data |
| Listings: create, edit, photos, featured, trash / restore, Excel export | ✓ | ✓ | view own |
| Viewings: approve, reject, complete, cancel (client is notified) | all | all | own listings |
| Transactions: record sale / letting, complete, cancel, PDF invoice, Excel | ✓ | ✓ | propose (pending) |
| Enquiries inbox (Contact, Sell, newsletter) — assign, notes, status | ✓ | ✓ | — |
| Users: create, edit, deactivate, trash / restore | everyone | agents & clients only | — |
| Remove an agent and reassign their listings | ✓ | ✓ | — |
| Activity log (who changed what) | ✓ | — | — |

**Business rules enforced by the API** (and covered by tests):
an agent can only act on their own listings, viewings and deals; viewings
follow `pending → approved → completed` (or rejected / cancelled — terminal);
two viewings can't be approved for the same slot; sold / let listings can't be
booked or sold again; completing a deal closes the listing, cancelling a
completed deal re-lists it; completed deals can't be edited or deleted;
managers can't create or modify admins; nobody can delete, deactivate or
demote themselves; the last active admin can't be removed; deactivating a
user signs them out everywhere immediately.

**Not included** (by design or not yet built — see HANDOVER.md → *Known
limitations*): online payments, Google / Apple sign-in (buttons show "not
available yet"), email verification, CMS for journal / team / services pages
(content lives in `frontend-user/src/data/`).

---

## Tech stack

- **API:** Laravel 12 (PHP 8.2+; Docker image uses 8.3), Sanctum bearer tokens,
  MySQL 8 / MariaDB, Redis (production cache + queue), DomPDF, Laravel Excel.
- **Frontends:** React 18, Vite 5, Tailwind CSS 3, React Router 6, Axios,
  Recharts (dashboard), react-hook-form.
- **Production:** Docker Compose (php-fpm, nginx, queue worker, scheduler,
  Redis, Caddy with automatic HTTPS); frontends are static builds.

---

## Local development

Prerequisites: PHP 8.2+ with `pdo_mysql`, `gd`, `zip`, `intl`; Composer 2;
Node 20+; MySQL 8 or MariaDB 10.6+ (or use SQLite, see below).

```bash
# 1. API
cd backend
cp .env.example .env                 # then set DB_* for your MySQL
composer install                     # on PHP 8.5 add: --ignore-platform-req=php+
php artisan key:generate
php artisan migrate --seed           # roles, admin, demo agents + 48 demo listings
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000

# in a second terminal — delivers queued emails (or set QUEUE_CONNECTION=sync)
php artisan queue:work

# 2. Public website
cd frontend-user && npm install && npm run dev -- --port 5174

# 3. Staff dashboard
cd frontend-dashboard && npm install && npm run dev -- --port 5173
```

No MySQL handy? Set `DB_CONNECTION=sqlite` in `backend/.env`, delete the other
`DB_*` lines, and run `php artisan migrate --seed` — Laravel creates
`database/database.sqlite`.

**Local logins** (from `backend/.env.example`; all `Password@123`):
`admin@zidaan.com` (admin), `manager@zidaan.com` (manager), `test@example.com`
(client), and six demo agents (`DemoAgentSeeder`). These come from
`SEED_DEMO_DATA=true` and must never exist on a real deployment.

Emails (password-reset codes, booking notices) go to
`backend/storage/logs/laravel.log` while `MAIL_MAILER=log`.

## Tests and checks

```bash
cd backend && php artisan test        # 45 feature tests: auth, roles, bookings, money, catalogue
cd frontend-dashboard && npm run lint && npm run build
cd frontend-user && npm run build
```

Tests use an in-memory SQLite database and never touch your data.

## Project layout

```
backend/
  app/Http/Controllers/Api/   one controller per area (Property, Booking, Transaction, User, Agent, Enquiry, ActivityLog…)
  app/Services/               business rules (BookingService, TransactionService, Notifier…)
  app/Http/Middleware/        RoleMiddleware (role gate), EnsureUserIsActive, SecurityHeaders
  routes/api.php              every endpoint, grouped by role
  database/migrations|seeders
  tests/Feature/              API tests
frontend-user/src/            pages/, components/, data/ (static site content), services/api.js
frontend-dashboard/src/       pages/, components/, utils/ (auth + url helpers), router.jsx
docker-compose.yml, Caddyfile production stack for the API
```

API reference: with `APP_ENV=local`, Swagger UI is at
http://127.0.0.1:8000/api/documentation (annotations are partial — `routes/api.php`
is the authoritative list).
