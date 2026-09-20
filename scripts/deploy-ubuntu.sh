#!/usr/bin/env bash

set -euo pipefail

APP_URL="${AKOMAPA_APP_URL:-http://localhost}"
APP_ROOT="${AKOMAPA_APP_ROOT:-/var/www/akomapa}"
SERVER_NAME="${AKOMAPA_SERVER_NAME:-localhost}"
PHP_VERSION="${AKOMAPA_PHP_VERSION:-}"
NGINX_PORT="${AKOMAPA_NGINX_PORT:-80}"
APP_SERVER="${AKOMAPA_APP_SERVER:-nginx}"
ARTISAN_HOST="${AKOMAPA_ARTISAN_HOST:-127.0.0.1}"
ARTISAN_PORT="${AKOMAPA_ARTISAN_PORT:-8080}"
CURRENT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log() {
    printf '\n==> %s\n' "$1"
}

need_command() {
    if ! command -v "$1" >/dev/null 2>&1; then
        printf 'Required command "%s" was not found.\n' "$1" >&2
        exit 1
    fi
}

check_php_version() {
    php -r 'exit(PHP_VERSION_ID >= 80300 ? 0 : 1);' || {
        printf 'PHP 8.3 or newer is required. Installed version: %s\n' "$(php -r 'echo PHP_VERSION;')" >&2
        exit 1
    }
}

sudo_if_needed() {
    if [ "$(id -u)" -eq 0 ]; then
        "$@"
    else
        sudo "$@"
    fi
}

detect_php_version() {
    if [ -n "$PHP_VERSION" ]; then
        printf '%s' "$PHP_VERSION"
        return
    fi

    php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;' 2>/dev/null || true
}

install_composer() {
    if command -v composer >/dev/null 2>&1; then
        return
    fi

    log 'Installing Composer'
    EXPECTED_SIGNATURE="$(curl -fsSL https://composer.github.io/installer.sig)"
    php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
    ACTUAL_SIGNATURE="$(php -r "echo hash_file('sha384', 'composer-setup.php');")"

    if [ "$EXPECTED_SIGNATURE" != "$ACTUAL_SIGNATURE" ]; then
        rm -f composer-setup.php
        printf 'Composer installer signature verification failed.\n' >&2
        exit 1
    fi

    php composer-setup.php --quiet
    rm -f composer-setup.php
    sudo_if_needed mv composer.phar /usr/local/bin/composer
}

install_node() {
    if command -v node >/dev/null 2>&1 && node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 22 ? 0 : 1)' >/dev/null 2>&1; then
        return
    fi

    log 'Installing Node.js 22'
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo_if_needed bash -
    sudo_if_needed apt-get install -y nodejs
}

install_packages() {
    log 'Installing Ubuntu packages'
    sudo_if_needed apt-get update

    local packages=(
        ca-certificates
        curl
        git
        rsync
        sqlite3
        unzip
        php
        php-bcmath
        php-cli
        php-curl
        php-fpm
        php-gd
        php-intl
        php-mbstring
        php-sqlite3
        php-xml
        php-zip
    )

    if [ "$APP_SERVER" = "nginx" ]; then
        packages+=(nginx)
    fi

    sudo_if_needed apt-get install -y "${packages[@]}"
}

configure_artisan_server() {
    if ! command -v systemctl >/dev/null 2>&1 || ! systemctl list-units >/dev/null 2>&1; then
        log 'Skipping artisan server service because systemd is not available'
        printf 'Run this manually: cd %s && php artisan serve --host=%s --port=%s\n' "$APP_ROOT" "$ARTISAN_HOST" "$ARTISAN_PORT"
        return
    fi

    log 'Configuring artisan server service'
    sudo_if_needed tee /etc/systemd/system/akomapa-http.service >/dev/null <<SERVICE
[Unit]
Description=Akomapa Laravel HTTP Server
After=network.target

[Service]
User=${USER}
Group=www-data
Restart=always
WorkingDirectory=${APP_ROOT}
ExecStart=/usr/bin/php artisan serve --host=${ARTISAN_HOST} --port=${ARTISAN_PORT}

[Install]
WantedBy=multi-user.target
SERVICE

    sudo_if_needed systemctl daemon-reload
    sudo_if_needed systemctl enable --now akomapa-http.service
}

sync_project() {
    if [ "$CURRENT_ROOT" = "$APP_ROOT" ]; then
        sudo_if_needed chown -R "$USER:www-data" "$APP_ROOT"
        return
    fi

    log "Copying project to $APP_ROOT"
    sudo_if_needed mkdir -p "$APP_ROOT"

    if command -v rsync >/dev/null 2>&1; then
        sudo_if_needed rsync -a --delete \
            --exclude='.git' \
            --exclude='.env' \
            --exclude='node_modules' \
            --exclude='vendor' \
            "$CURRENT_ROOT/" "$APP_ROOT/"
    else
        sudo_if_needed cp -a "$CURRENT_ROOT/." "$APP_ROOT/"
    fi

    sudo_if_needed chown -R "$USER:www-data" "$APP_ROOT"
}

configure_nginx() {
    local php_version
    local socket_path

    php_version="$(detect_php_version)"
    socket_path="/run/php/php${php_version}-fpm.sock"

    if [ ! -S "$socket_path" ]; then
        socket_path="$(find /run/php -maxdepth 1 -type s -name 'php*-fpm.sock' | head -n 1 || true)"
    fi

    if [ -z "$socket_path" ]; then
        printf 'Unable to find a PHP-FPM socket in /run/php.\n' >&2
        exit 1
    fi

    log 'Configuring Nginx'
    sudo_if_needed tee /etc/nginx/sites-available/akomapa >/dev/null <<NGINX
server {
    listen ${NGINX_PORT};
    server_name ${SERVER_NAME};

    root ${APP_ROOT}/public;
    index index.php index.html;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:${socket_path};
    }

    location ~ /\.ht {
        deny all;
    }
}
NGINX

    sudo_if_needed ln -sfn /etc/nginx/sites-available/akomapa /etc/nginx/sites-enabled/akomapa
    sudo_if_needed rm -f /etc/nginx/sites-enabled/default
    sudo_if_needed nginx -t
}

configure_queue_worker() {
    if ! command -v systemctl >/dev/null 2>&1 || ! systemctl list-units >/dev/null 2>&1; then
        log 'Skipping queue worker service because systemd is not available'
        printf 'Run this manually when needed: cd %s && php artisan queue:work --tries=3 --timeout=90\n' "$APP_ROOT"
        return
    fi

    log 'Configuring queue worker service'
    sudo_if_needed tee /etc/systemd/system/akomapa-queue.service >/dev/null <<SERVICE
[Unit]
Description=Akomapa Laravel Queue Worker
After=network.target

[Service]
User=www-data
Group=www-data
Restart=always
WorkingDirectory=${APP_ROOT}
ExecStart=/usr/bin/php artisan queue:work --tries=3 --timeout=90

[Install]
WantedBy=multi-user.target
SERVICE

    sudo_if_needed systemctl daemon-reload
    sudo_if_needed systemctl enable --now akomapa-queue.service
}

restart_services() {
    log 'Restarting services'

    if [ "$APP_SERVER" = "artisan" ]; then
        if command -v systemctl >/dev/null 2>&1 && systemctl list-units >/dev/null 2>&1; then
            sudo_if_needed systemctl restart akomapa-http.service
        fi

        return
    fi

    if command -v systemctl >/dev/null 2>&1 && systemctl list-units >/dev/null 2>&1; then
        sudo_if_needed systemctl restart "php$(detect_php_version)-fpm" || true
        sudo_if_needed systemctl restart nginx
        return
    fi

    sudo_if_needed service "php$(detect_php_version)-fpm" restart || true
    sudo_if_needed service nginx restart
}

main() {
    install_packages
    need_command php
    check_php_version
    install_composer
    install_node
    sync_project

    cd "$APP_ROOT"

    log 'Installing application dependencies and running Laravel deployment setup'
    AKOMAPA_APP_URL="$APP_URL" composer install --no-dev --optimize-autoloader --no-interaction

    log 'Setting application permissions'
    sudo_if_needed chown -R www-data:www-data "$APP_ROOT/storage" "$APP_ROOT/bootstrap/cache" "$APP_ROOT/database"
    sudo_if_needed find "$APP_ROOT/storage" "$APP_ROOT/bootstrap/cache" -type d -exec chmod 775 {} +
    sudo_if_needed find "$APP_ROOT/storage" "$APP_ROOT/bootstrap/cache" -type f -exec chmod 664 {} +

    case "$APP_SERVER" in
        nginx)
            configure_nginx
            ;;
        artisan)
            configure_artisan_server
            ;;
        *)
            printf 'Unsupported AKOMAPA_APP_SERVER value: %s\n' "$APP_SERVER" >&2
            exit 1
            ;;
    esac

    configure_queue_worker
    restart_services

    log 'Ubuntu deployment complete'
    printf 'Open: %s\n' "$APP_URL"
    if [ "$APP_SERVER" = "nginx" ]; then
        printf 'Nginx listens on: %s\n' "$NGINX_PORT"
        printf 'Nginx document root: %s/public\n' "$APP_ROOT"
    else
        printf 'Artisan server listens on: %s:%s\n' "$ARTISAN_HOST" "$ARTISAN_PORT"
    fi
}

main "$@"
