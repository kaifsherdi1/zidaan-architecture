# syntax=docker/dockerfile:1

# ---------- Stage 1: PHP dependencies ----------
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
      --no-dev --no-scripts --no-autoloader --no-interaction --prefer-dist \
      --ignore-platform-req=php+
COPY . .
RUN composer dump-autoload --optimize --no-dev --classmap-authoritative --no-scripts

# ---------- Stage 2: Runtime ----------
FROM php:8.3-fpm-alpine AS runtime

# System + PHP extensions
RUN apk add --no-cache \
      bash git icu-dev libzip-dev libpng-dev libjpeg-turbo-dev freetype-dev \
      oniguruma-dev $PHPIZE_DEPS \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j"$(nproc)" \
      pdo_mysql bcmath gd zip intl exif pcntl opcache \
 && apk del $PHPIZE_DEPS \
 && rm -rf /var/cache/apk/*

# Production PHP config
RUN { \
      echo "opcache.enable=1"; \
      echo "opcache.enable_cli=0"; \
      echo "opcache.jit=tracing"; \
      echo "opcache.jit_buffer_size=64M"; \
      echo "opcache.memory_consumption=192"; \
      echo "opcache.max_accelerated_files=20000"; \
      echo "opcache.validate_timestamps=0"; \
      echo "realpath_cache_size=4096K"; \
      echo "realpath_cache_ttl=600"; \
      echo "expose_php=0"; \
      echo "memory_limit=256M"; \
      echo "upload_max_filesize=12M"; \
      echo "post_max_size=16M"; \
    } > /usr/local/etc/php/conf.d/zz-production.ini

WORKDIR /var/www/html

COPY --from=vendor /app/vendor ./vendor
COPY . .

# Entrypoint runs migrations + cache warmup, then hands off to php-fpm / artisan
COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint \
 && mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
 && chown -R www-data:www-data storage bootstrap/cache \
 && chmod -R ug+rw storage bootstrap/cache

USER www-data

ENTRYPOINT ["entrypoint"]
CMD ["php-fpm"]

# ---------- Stage 3: Web (nginx that fronts php-fpm) ----------
FROM nginx:1.27-alpine AS web
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=runtime /var/www/html/public /var/www/html/public

