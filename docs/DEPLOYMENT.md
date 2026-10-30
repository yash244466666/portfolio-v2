# Deployment

The site is a static Next.js export. `pnpm build` writes it to `out/`.

| Branch | Environment | URL | VPS path |
|---|---|---|---|
| `develop` | beta | https://beta.yashcodes.com | `/data/sites/beta/` |
| `main` | production | https://yashcodes.com | `/data/sites/production/` |

Every push to `develop` or `main` runs `.github/workflows/deploy.yml`:
install with a frozen lockfile, type-check, build, upload `out/`, then rsync it
to the matching VPS directory. Pull requests only run the build; they never
deploy. A manual run can be started with **Actions → Build and deploy → Run
workflow** on the chosen branch.

## Required GitHub secrets

Set these once under **Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `VPS_HOST` | `152.67.67.128` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | private key of the CI deploy key |
| `VPS_KNOWN_HOSTS` | output of `ssh-keyscan -H 152.67.67.128` |

The `deploy` user is not in the `docker` group and has no sudo. It can write
only to `/data/sites`.

## One-time VPS setup

Already applied on vps-1. For reference:

```bash
sudo useradd --create-home --shell /bin/bash deploy
sudo groupadd -f site-deploy
sudo usermod -aG site-deploy deploy
sudo usermod -aG site-deploy yash
sudo chgrp -R site-deploy /data/sites
sudo chmod -R g+rwX /data/sites
sudo find /data/sites -type d -exec chmod g+s {} +
sudo install -d -m 2775 -o yash -g site-deploy /data/sites/production
```

`/data/sites` is mounted read-only into the Caddy container as `/srv/sites`.

## Production cutover

`yashcodes.com` currently resolves to `103.65.138.220`, not to this VPS. To
serve production from the VPS:

1. In Dynadot, change the `yashcodes.com` **A record** to `152.67.67.128`
   (TTL 300).
2. Wait for DNS to resolve to the new address:

   ```bash
   getent ahosts yashcodes.com
   ```

3. Add this block to `/opt/stacks/caddy/Caddyfile` on vps-1:

   ```caddyfile
   yashcodes.com {
       root * /srv/sites/production
       encode gzip zstd
       try_files {path} {path}.html {path}/index.html
       file_server
       handle_errors {
           rewrite * /404.html
           file_server
       }
       header {
           Strict-Transport-Security "max-age=31536000"
           X-Content-Type-Options "nosniff"
           Referrer-Policy "strict-origin-when-cross-origin"
       }
       @immutable path /_next/static/*
       header @immutable Cache-Control "public, max-age=31536000, immutable"
       log {
           output file /data/caddy/logs/production-access.log {
               roll_size 20mb
               roll_keep 3
               roll_keep_for 720h
           }
           format json
       }
   }
   ```

4. Validate and reload Caddy:

   ```bash
   docker exec caddy caddy validate --config /etc/caddy/Caddyfile
   docker exec caddy caddy reload --config /etc/caddy/Caddyfile
   ```

5. Enable the commented `Verify production` step in the workflow, then push a
   commit to `main` (or run the workflow manually) and confirm:

   ```bash
   curl -I https://yashcodes.com
   ```

## Rollback

The workflow keeps the built artifact for 7 days. To restore a previous
release, either revert the bad commit on the same branch and push, or download
the older artifact and sync it manually:

```bash
gh run download <run-id> -n site -D /tmp/site
rsync -az --delete --delay-updates -e "ssh -i ~/.ssh/portfolio-v2-deploy" \
  /tmp/site/ deploy@152.67.67.128:/data/sites/beta/
```

The deploy key must exist locally for a manual rollback.
