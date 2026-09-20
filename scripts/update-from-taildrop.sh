#!/usr/bin/env bash

set -euo pipefail

APP_ROOT="${AKOMAPA_APP_ROOT:-/var/www/akomapa}"
APP_URL="${AKOMAPA_APP_URL:-http://localhost}"
ARCHIVE="${AKOMAPA_ARCHIVE:-}"
INBOX="${AKOMAPA_TAILDROP_INBOX:-/tmp/akomapa-taildrop}"

log() {
    printf '\n==> %s\n' "$1"
}

fail() {
    printf '%s\n' "$1" >&2
    exit 1
}

sudo_if_needed() {
    if [ "$(id -u)" -eq 0 ]; then
        "$@"
    else
        sudo "$@"
    fi
}

newest_archive() {
    find "$INBOX" -maxdepth 1 -type f \( -name '*.tar.gz' -o -name '*.tgz' \) -printf '%T@ %p\n' \
        | sort -nr \
        | head -n 1 \
        | cut -d' ' -f2-
}

receive_taildrop_archive() {
    mkdir -p "$INBOX"

    if command -v tailscale >/dev/null 2>&1; then
        log "Receiving Taildrop files into $INBOX"
        tailscale file get "$INBOX"
        return
    fi

    if command -v tailscale.exe >/dev/null 2>&1; then
        log "Receiving Taildrop files into $INBOX using Windows Tailscale"
        tailscale.exe file get "$(wslpath -w "$INBOX")"
        return
    fi

    fail 'Tailscale CLI was not found. Set AKOMAPA_ARCHIVE=/path/to/akomapa.tar.gz to update from an existing archive.'
}

find_app_source() {
    local extract_root="$1"
    local candidate

    if [ -f "$extract_root/artisan" ] && [ -f "$extract_root/composer.json" ]; then
        printf '%s' "$extract_root"
        return
    fi

    candidate="$(find "$extract_root" -mindepth 1 -maxdepth 2 -type f -name artisan -printf '%h\n' | head -n 1)"

    if [ -n "$candidate" ] && [ -f "$candidate/composer.json" ]; then
        printf '%s' "$candidate"
        return
    fi

    fail 'The archive does not look like a Laravel app archive.'
}

restart_services() {
    if command -v systemctl >/dev/null 2>&1 && systemctl list-units >/dev/null 2>&1; then
        sudo_if_needed systemctl restart akomapa-queue.service 2>/dev/null || true
        sudo_if_needed systemctl reload nginx 2>/dev/null || sudo_if_needed systemctl restart nginx 2>/dev/null || true
        return
    fi

    sudo_if_needed service nginx reload 2>/dev/null || sudo_if_needed service nginx restart 2>/dev/null || true
}

if [ -z "$ARCHIVE" ]; then
    receive_taildrop_archive
    ARCHIVE="$(newest_archive)"
fi

if [ -z "$ARCHIVE" ] || [ ! -f "$ARCHIVE" ]; then
    fail "No archive found. Send one with: tailscale file cp akomapa.tar.gz <deploy-machine>:"
fi

if [ ! -d "$APP_ROOT" ]; then
    fail "App root does not exist: $APP_ROOT"
fi

command -v tar >/dev/null 2>&1 || fail 'tar is required.'
command -v rsync >/dev/null 2>&1 || fail 'rsync is required.'
command -v composer >/dev/null 2>&1 || fail 'composer is required.'
command -v npm >/dev/null 2>&1 || fail 'npm is required.'

EXTRACT_DIR="$(mktemp -d)"
trap 'rm -rf "$EXTRACT_DIR"' EXIT

log "Extracting $ARCHIVE"
tar -xzf "$ARCHIVE" -C "$EXTRACT_DIR"

SOURCE_ROOT="$(find_app_source "$EXTRACT_DIR")"

log "Updating existing app at $APP_ROOT"
sudo_if_needed rsync -a --checksum \
    --exclude='.git' \
    --exclude='.env' \
    --exclude='node_modules' \
    --exclude='vendor' \
    --exclude='storage' \
    --exclude='database/database.sqlite' \
    "$SOURCE_ROOT/" "$APP_ROOT/"

sudo_if_needed chown -R "$USER:www-data" "$APP_ROOT"

cd "$APP_ROOT"

log 'Running Composer post-install deployment flow'
AKOMAPA_APP_URL="$APP_URL" composer install --no-dev --optimize-autoloader --no-interaction

log 'Fixing writable permissions'
sudo_if_needed chown -R www-data:www-data "$APP_ROOT/storage" "$APP_ROOT/bootstrap/cache" "$APP_ROOT/database"
sudo_if_needed find "$APP_ROOT/storage" "$APP_ROOT/bootstrap/cache" -type d -exec chmod 775 {} +
sudo_if_needed find "$APP_ROOT/storage" "$APP_ROOT/bootstrap/cache" -type f -exec chmod 664 {} +

log 'Restarting services'
restart_services

log 'Update complete'
printf 'Updated from: %s\n' "$ARCHIVE"
printf 'App root: %s\n' "$APP_ROOT"
