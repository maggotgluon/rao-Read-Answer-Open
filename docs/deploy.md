# Deploy to Plesk / ขั้นตอน deploy ขึ้น Plesk

How it works / หลักการ:
`git push` to `main` → GitHub Actions runs tests → builds (`vendor/` + `public/build/`)
→ force-pushes the finished app to branch **`deploy`** → Plesk Git pulls `deploy`.

> ⚠️ Not yet verified on the real server — update this file with what actually
> worked on the first deploy. / ยังไม่ได้ทดสอบกับเซิร์ฟเวอร์จริง

## One-time setup / ตั้งค่าครั้งแรก

1. **Subdomain** `rao.mag.codes` → PHP **8.3+** (Laravel 13), HTTPS (Let's Encrypt).
2. **Database:** create MySQL DB + user in Plesk.
3. **Plesk → Git:** add the GitHub repo (private → use Plesk's SSH deploy key,
   add it to GitHub repo → Settings → Deploy keys, read-only).
    - Branch: **`deploy`**
    - Deployment mode: automatic (or manual), path e.g. `/rao`
4. **Document root** of the subdomain → `/rao/public`.
5. **`.env`** — upload once via File Manager to `/rao/.env` (never in git):
    ```env
    APP_NAME=Rao
    APP_ENV=production
    APP_DEBUG=false
    APP_URL=https://rao.mag.codes
    APP_KEY=            # generate locally: php artisan key:generate --show
    APP_LOCALE=th
    DB_CONNECTION=mysql
    DB_HOST=localhost
    DB_DATABASE=...
    DB_USERNAME=...
    DB_PASSWORD="..."   # quote it if it has special characters
    SESSION_DRIVER=database
    QUEUE_CONNECTION=database
    CACHE_STORE=database
    MAIL_MAILER=smtp
    MAIL_HOST=...       # Plesk mail; set SPF/DKIM/DMARC for the domain
    MAIL_PORT=587
    MAIL_USERNAME=...
    MAIL_PASSWORD="..."
    MAIL_FROM_ADDRESS=hello@mag.codes
    ```
6. **Plesk Git → "Additional deployment actions"** (path to PHP depends on host,
   usually `/opt/plesk/php/8.4/bin/php`):
    ```bash
    /opt/plesk/php/8.4/bin/php artisan migrate --force
    /opt/plesk/php/8.4/bin/php artisan db:seed --class=PromptLibrarySeeder --force   # idempotent / รันซ้ำได้
    /opt/plesk/php/8.4/bin/php artisan optimize
    ```
7. **Scheduled task** (Plesk → Scheduled Tasks), every minute:
    ```bash
    cd /var/www/vhosts/<domain>/rao && /opt/plesk/php/8.4/bin/php artisan schedule:run
    ```
    Drives the queue, `spaces:purge`, and (later) daily prompts, reminders, backups.

## Every deploy / ทุกครั้งที่ deploy

`git push origin main` → wait for the green check in GitHub Actions → Plesk pulls
(automatic) or click **Pull updates** + **Deploy**.

## Rollback / ย้อนกลับ

Re-run an older successful "test-and-deploy" workflow run (Actions → run →
Re-run jobs), or revert the commit on `main` and push.
