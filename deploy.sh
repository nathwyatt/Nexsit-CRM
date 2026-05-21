#!/bin/bash
set -e

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
die()     { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Nexsit CRM — Deployment Script"
echo "  Target: crm.nexsitsolution.com"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── Inputs ────────────────────────────────────────────────────────────────────
read -rsp "MySQL root password: " MYSQL_ROOT_PASS; echo ""
read -rsp "Set a password for the nexsit_crm database user: " DB_PASS; echo ""
echo ""

DOMAIN="crm.nexsitsolution.com"
DB_NAME="nexsit_crm"
DB_USER="nexsit_crm"
INSTALL_DIR="/var/www/nexsit-crm"
PHP_VER="8.2"
REPO="https://github.com/nathwyatt/Nexsit-CRM.git"

# ── 1. System packages ────────────────────────────────────────────────────────
info "Updating system packages..."
apt-get update -qq

info "Installing Nginx, PHP ${PHP_VER}, MySQL client, Certbot..."
apt-get install -y -qq \
    nginx \
    software-properties-common \
    curl git unzip

add-apt-repository -y ppa:ondrej/php > /dev/null 2>&1
apt-get update -qq

apt-get install -y -qq \
    php${PHP_VER}-fpm \
    php${PHP_VER}-mysql \
    php${PHP_VER}-mbstring \
    php${PHP_VER}-xml \
    php${PHP_VER}-curl \
    php${PHP_VER}-zip \
    php${PHP_VER}-gd \
    php${PHP_VER}-bcmath \
    php${PHP_VER}-intl \
    php${PHP_VER}-tokenizer \
    php${PHP_VER}-fileinfo

success "PHP ${PHP_VER} installed."

# ── 2. Composer ───────────────────────────────────────────────────────────────
if ! command -v composer &> /dev/null; then
    info "Installing Composer..."
    curl -sS https://getcomposer.org/installer | php
    mv composer.phar /usr/local/bin/composer
    chmod +x /usr/local/bin/composer
    success "Composer installed."
else
    success "Composer already present."
fi

# ── 3. Node.js ────────────────────────────────────────────────────────────────
if ! command -v node &> /dev/null; then
    info "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt-get install -y -qq nodejs
    success "Node.js $(node -v) installed."
else
    success "Node.js already present: $(node -v)"
fi

# ── 4. Clone repo ─────────────────────────────────────────────────────────────
if [ -d "$INSTALL_DIR" ]; then
    warn "Directory $INSTALL_DIR already exists — pulling latest changes..."
    cd "$INSTALL_DIR"
    git pull origin main
else
    info "Cloning repository..."
    git clone "$REPO" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi
success "Repository ready."

# ── 5. PHP dependencies ───────────────────────────────────────────────────────
info "Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction -q
success "Composer dependencies installed."

# ── 6. Node dependencies + build ─────────────────────────────────────────────
info "Installing Node dependencies and building frontend..."
npm install --silent
npm run build
success "Frontend built."

# ── 7. Database ───────────────────────────────────────────────────────────────
info "Creating database and user..."
mysql -u root -p"${MYSQL_ROOT_PASS}" <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL
success "Database ready."

# ── 8. Environment file ───────────────────────────────────────────────────────
info "Creating .env file..."
cat > "$INSTALL_DIR/.env" <<ENV
APP_NAME="Nexsit CRM"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://${DOMAIN}
APP_CURRENCY=RWF
APP_COUNTRY=RW

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=${DB_NAME}
DB_USERNAME=${DB_USER}
DB_PASSWORD=${DB_PASS}

SESSION_DRIVER=database
SESSION_LIFETIME=120
CACHE_STORE=database
QUEUE_CONNECTION=sync

FILESYSTEM_DISK=local
MEDIA_DISK=public

REDIS_CLIENT=predis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_FROM_ADDRESS="noreply@nexsitsolution.com"
MAIL_FROM_NAME="Nexsit CRM"
ENV

php artisan key:generate --force
success ".env configured."

# ── 9. Migrations & seeds ─────────────────────────────────────────────────────
info "Running migrations..."
php artisan migrate --force
info "Seeding database..."
php artisan db:seed --force
success "Database migrated and seeded."

# ── 10. Storage ───────────────────────────────────────────────────────────────
info "Linking storage..."
php artisan storage:link || true
chown -R www-data:www-data "$INSTALL_DIR"
chmod -R 755 "$INSTALL_DIR"
chmod -R 775 "$INSTALL_DIR/storage" "$INSTALL_DIR/bootstrap/cache"
success "Storage linked and permissions set."

# ── 11. Optimise ──────────────────────────────────────────────────────────────
info "Caching config, routes, views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
success "Application optimised."

# ── 12. Nginx ─────────────────────────────────────────────────────────────────
info "Creating Nginx virtual host..."
cat > /etc/nginx/sites-available/nexsit-crm <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};
    root ${INSTALL_DIR}/public;

    index index.php;
    charset utf-8;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php\$ {
        fastcgi_pass unix:/var/run/php/php${PHP_VER}-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
        fastcgi_read_timeout 120;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    client_max_body_size 20M;
}
NGINX

ln -sf /etc/nginx/sites-available/nexsit-crm /etc/nginx/sites-enabled/nexsit-crm
nginx -t
systemctl reload nginx
success "Nginx configured."

# ── 13. SSL ───────────────────────────────────────────────────────────────────
info "Installing SSL certificate..."
apt-get install -y -qq certbot python3-certbot-nginx
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m admin@nexsitsolution.com --redirect
success "SSL certificate installed."

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ${GREEN}Deployment complete!${NC}"
echo ""
echo "  URL:      https://${DOMAIN}"
echo "  Admin:    superadmin@nexsit.com"
echo "  Password: SuperAdmin@2026"
echo ""
echo "  ⚠  Change the super admin password after first login!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
