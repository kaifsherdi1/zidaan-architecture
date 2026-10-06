# Deployment & Operations

How to put the platform on the internet for real users, keep it updated,
back it up, and recover it. Written for whoever runs the server.

```
https://www.example.com     → frontend-user        (static build: any static host / CDN)
https://admin.example.com   → frontend-dashboard   (static build)
https://api.example.com     → Laravel API          (one Linux server, docker compose)
MySQL                       → managed database (recommended) or your own MySQL 8
```

The frontends call the API cross-origin, so the API's `CORS_ALLOWED_ORIGINS`
must list both frontend origins exactly.

---

## 1. What you need before starting

| Item | Notes |
|---|---|
| A domain | Three hostnames: site, admin, api. |
| A Linux server for the API | Ubuntu 22.04/24.04, 2 GB RAM / 1 vCPU minimum, ports 80 + 443 open. Any VPS (DigitalOcean, Hetzner, Lightsail, Oracle…). |
| MySQL 8 database | Managed (DigitalOcean, Aiven, RDS — includes automatic backups) **recommended**, or MySQL on the same server. Create a dedicated user with rights on this one database only. |
| SMTP email account | Resend, Postmark, Amazon SES, Zoho… Verify the sending domain (SPF + DKIM) or mail will land in spam. Required: password reset codes and viewing notices are sent by email. |
| Static hosting for the two frontends | Cloudflare Pages, Netlify, Vercel, or nginx on any server. |

The client must supply / own: the domain, DNS access, the SMTP account and the
database / server accounts. See HANDOVER.md → *Accounts the client must own*.

## 2. Environment variables

Three files, never committed (all are git-ignored):

| File | Template | Used by |
|---|---|---|
| `.env` (repo root) | `.env.example` | docker compose: `API_DOMAIN`, `RUN_SEED` |
| `backend/.env.production` | `backend/.env.production.example` | the API containers |
| Frontend build settings | `frontend-*/.env.example` | Vite, at build time |

`backend/.env.production` — every key is documented inline in the template.
The ones that must be set:

| Key | Meaning |
|---|---|
| `APP_KEY` | Encryption key. Generate once (step 4), keep forever, never share. |
| `APP_URL` | `https://api.example.com` |
| `FRONTEND_URL`, `DASHBOARD_URL` | Used for links in emails. |
| `CORS_ALLOWED_ORIGINS` | `https://www.example.com,https://admin.example.com` |
| `DB_HOST/PORT/DATABASE/USERNAME/PASSWORD` | MySQL connection. `MYSQL_ATTR_SSL_CA` if the provider requires TLS. |
| `MAIL_*` | SMTP credentials and from-address. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First administrator, created on first seed. Production refuses weak passwords (12+ chars, mixed case, number, symbol). |
| `SEED_DEMO_DATA` | **`false`** for a real business. `true` loads 48 sample listings and public demo logins. |

Frontend build variables:

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://api.example.com/api` (both apps) |
| `VITE_PUBLIC_SITE_URL` | `https://www.example.com` (dashboard only) |
| `VITE_SHOW_DEMO_CREDENTIALS` | leave unset / `false` |

## 3. Server preparation (once)

```bash
# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER        # log out and back in

# Firewall: only SSH + web
sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable

# Code
git clone <repo-url> /opt/zidaan && cd /opt/zidaan
cp .env.example .env                                   # set API_DOMAIN
cp backend/.env.production.example backend/.env.production   # fill in (section 2)
mkdir -p backend/certs                                 # only if the DB needs a CA file
```

Point DNS: `api.example.com` → A record → the server's public IP. Wait until
`dig +short api.example.com` returns that IP (Caddy needs it to issue HTTPS).

## 4. First deployment

```bash
cd /opt/zidaan
docker compose build
docker compose run --rm app php artisan key:generate --show   # paste into APP_KEY
RUN_SEED=true docker compose up -d                            # migrates + creates roles and the admin
docker compose logs -f app caddy                              # watch it start; Ctrl+C when healthy
```

Check:

```bash
curl -fsS https://api.example.com/up          # 200 = app booted AND database reachable
curl -fsS https://api.example.com/api/properties | head -c 200
```

Then:

1. Set `RUN_SEED=false` in `.env` (re-seeding is harmless — it never resets the
   admin password — but keep first-run steps explicit).
2. Remove `ADMIN_PASSWORD` from `backend/.env.production`, and restart:
   `docker compose up -d`.
3. Sign in to the dashboard and change the admin password (Profile).

**Frontends** — for each of `frontend-user` and `frontend-dashboard`:
root directory = that folder, build command `npm ci && npm run build`, output
directory `dist`, environment variables from section 2. Both folders include a
`public/_redirects` SPA fallback (Netlify / Cloudflare Pages). On plain nginx,
use the provided `nginx.conf` (or the `Dockerfile`).

Attach `www.example.com` and `admin.example.com` to the two static sites.

## 5. Deploying an update

```bash
cd /opt/zidaan
git fetch && git log --oneline HEAD..origin/main     # see what's coming
# take a database backup / snapshot first (section 7)
git pull
docker compose build
docker compose up -d          # `app` runs migrations, then config/route/event caches are rebuilt
curl -fsS https://api.example.com/up
```

Frontends redeploy automatically when the static host watches the branch.

Migrations are additive in this codebase; run `php artisan migrate:status`
first if you want to see pending ones:
`docker compose run --rm app php artisan migrate:status`.

## 6. Rolling back a bad deploy

```bash
cd /opt/zidaan
git log --oneline -5                       # find the last good commit
git checkout <good-commit>
# Only if the bad release added migrations that must be undone:
docker compose run --rm app php artisan migrate:rollback --step=<n>
docker compose build && docker compose up -d
```

If data was damaged, restore the pre-deploy backup (section 7) instead of
rolling migrations back. Frontends: redeploy the previous build from the static
host's deploy history (one click on Cloudflare Pages / Netlify / Vercel).

## 7. Backups and restore

What must be backed up:

1. **The MySQL database** — all business data.
2. **Uploaded photos** — the `zidaan_storage_data` Docker volume.
3. **`backend/.env.production`** — especially `APP_KEY`. Store it in a password
   manager, not on the same server only.

**Managed database:** turn on the provider's daily automatic backups (7+ days
retention) and point-in-time recovery if offered. Test a restore once.

**Manual / self-hosted database dump** (run from cron nightly, copy off-server):

```bash
# dump (uses the DB credentials in backend/.env.production)
docker compose run --rm app sh -c 'mysqldump --single-transaction --no-tablespaces \
  -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE"' \
  | gzip > backups/db-$(date +%F).sql.gz
```

> The `app` image does not ship the `mysqldump` client. Either install
> `mysql-client` on the host and run the same `mysqldump` command there, or use
> your managed database's backup feature. `docker run --rm mysql:8 mysqldump …`
> also works.

**Photos:**

```bash
docker run --rm -v zidaan_storage_data:/data -v "$PWD/backups":/backup alpine \
  tar czf /backup/storage-$(date +%F).tgz -C /data .
```

**Restore:**

```bash
gunzip -c backups/db-YYYY-MM-DD.sql.gz | mysql -h <host> -P <port> -u <user> -p <database>
docker run --rm -v zidaan_storage_data:/data -v "$PWD/backups":/backup alpine \
  sh -c 'cd /data && tar xzf /backup/storage-YYYY-MM-DD.tgz'
docker compose restart app
```

Keep at least 7 daily and 4 weekly copies somewhere other than this server
(object storage, another machine).

## 8. Monitoring and logs

- **Health:** `https://api.example.com/up` returns 200 only when the app boots
  *and* the database answers. Point a free uptime monitor (UptimeRobot,
  Better Stack) at it, alerting by email/SMS.
- **Logs:** `docker compose logs --tail=200 app queue` — Laravel writes daily
  files to `storage/logs` inside the container (30 days kept, level `warning`
  and above). Passwords, tokens and OTP codes are never logged.
- **Email delivery:** failed emails are retried 3 times by the `queue`
  container; check `docker compose logs queue` and the SMTP provider's dashboard.
  `docker compose run --rm app php artisan queue:failed` lists permanent failures.
- **Scheduled jobs** (`scheduler` container, daily): prune expired login tokens,
  expired password-reset codes, old failed jobs.
- **Errors:** for alerting on exceptions, add Sentry (free tier) — not wired in.

## 9. Security checklist for go-live

- [ ] `APP_ENV=production`, `APP_DEBUG=false` (stack traces are never shown to users).
- [ ] `SEED_DEMO_DATA=false`; no `@example.com` / `Password@123` accounts exist
      (`Users` page → search "example").
- [ ] `VITE_SHOW_DEMO_CREDENTIALS` not set on either frontend build.
- [ ] Admin password changed after first login; `ADMIN_PASSWORD` removed from the env file.
- [ ] `CORS_ALLOWED_ORIGINS` lists exactly the two frontend origins.
- [ ] Database user has rights on this database only; DB not reachable from the internet (or TLS + IP allow-list).
- [ ] Server: SSH key login only, firewall allows 22/80/443 only, unattended security upgrades on.
- [ ] Backups running and one restore tested.
- [ ] Uptime monitor on `/up`.

Built in: HTTPS with HSTS (Caddy), security headers on every API response,
rate limits (login/register 10/min per IP; password reset & contact forms
5/min; API 90/min per user), bcrypt passwords, 7-day expiring tokens revoked on
logout / password change / deactivation, role checks on every endpoint, upload
validation (images only, 5 MB, random filenames), audit log of staff actions.

## 10. Low-cost hosting option

For a demo or staging copy, the same stack runs on free tiers: Oracle Cloud
"Always Free" VM for the API, Aiven free MySQL (needs `MYSQL_ATTR_SSL_CA`),
DuckDNS for the hostname, Cloudflare Pages for the frontends, Resend free plan
for email. These have no uptime guarantee (Oracle can reclaim idle VMs), so
use paid hosting for the client's live site.
