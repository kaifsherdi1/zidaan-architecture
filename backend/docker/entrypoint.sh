#!/bin/bash
set -e

cd /var/www/html

# Wait for the database to accept connections (max ~60s). Credentials are read
# from the environment inside PHP, so quotes in a password can't break the probe;
# TLS is used when MYSQL_ATTR_SSL_CA is set (required by managed MySQL like Aiven).
if [ -n "$DB_HOST" ]; then
  echo "Waiting for database at $DB_HOST:${DB_PORT:-3306} ..."
  for i in $(seq 1 30); do
    if php -r '
      $opts = getenv("MYSQL_ATTR_SSL_CA") ? [PDO::MYSQL_ATTR_SSL_CA => getenv("MYSQL_ATTR_SSL_CA")] : [];
      new PDO("mysql:host=" . getenv("DB_HOST") . ";port=" . (getenv("DB_PORT") ?: 3306), getenv("DB_USERNAME"), getenv("DB_PASSWORD"), $opts);
    ' 2>/dev/null; then
      echo "Database is up."
      break
    fi
    if [ "$i" = "30" ]; then
      echo "Database still unreachable after 60s — continuing; migrations will report the real error." >&2
    fi
    sleep 2
  done
fi

# Every PHP container: discover packages and cache config/routes/events.
php artisan package:discover --ansi || true
php artisan config:cache
php artisan route:cache
php artisan event:cache

# Release tasks — only the `app` service sets RUN_RELEASE_TASKS=true.
if [ "${RUN_RELEASE_TASKS:-false}" = "true" ]; then
  php artisan migrate --force --no-interaction

  if [ "${RUN_SEED:-false}" = "true" ]; then
    # Not "|| true": a failed seed (e.g. missing ADMIN_PASSWORD) must stop the release.
    php artisan db:seed --force --no-interaction
  fi

  php artisan storage:link || true
fi

exec "$@"
