# Deployment

The site is a static Next.js export. `pnpm build` writes it to `out/`.

| Branch | Environment | URL | VPS path | Caddy root |
|---|---|---|---|---|
| `develop` | beta | https://beta.yashcodes.com | `/data/sites/beta/` | `/srv/sites/beta` |
| `main` | production | https://yashcodes.com | `/data/sites/production/` | `/srv/sites/production` |

## Current status (2026-10-31)

- **Both deploys are green.** The `develop` workflow built and deployed beta; the `main` workflow built and deployed production to `/data/sites/production`. The deployed build is about 14 MB.
- **Beta is healthy.** `/` and `/tools/` return 200 and an unknown path returns 404. The five project images and the pdf.js worker are present.
- **The first attempts were blocked by a GitHub incident.** GitHub Actions, Pages, and Webhooks were degraded from 2026-10-30 17:50 UTC. Queued jobs were marked failed without starting. The subsequent `develop` and `main` runs completed successfully.
- **One `main` build failed on a transient Google Fonts fetch.** The error was `TypeError: Cannot read properties of null (reading '1')` in `next/font`. A retry succeeded. The workflow now retries the build up to three times.
- **Production is not serving from the VPS yet.** `yashcodes.com` still resolves to `103.65.138.220`, and Caddy has no `yashcodes.com` block. The production files are deployed to `/data/sites/production`, but the domain cannot be served from the VPS until the DNS A record changes to `152.67.67.128`.
- **The production Caddy block has been validated** with `caddy validate`, but it has not been added to the live Caddyfile.
- **Deployment commits:** `d910548` (initial CI/CD), `e7570bc` (rsync ownership fix), and `415c12d` (documentation).

## What the workflow does

`.github/workflows/deploy.yml` runs on:

- Push to `develop`
- Push to `main`
- Pull request targeting `develop` or `main`
- Manual dispatch

The **build** job:

1. Checks out the repository.
2. Installs pnpm 12.8.1.
3. Installs Node 24 with pnpm caching.
4. Runs `pnpm install --frozen-lockfile`.
5. Runs `./node_modules/.bin/tsc --noEmit --incremental false`.
6. Runs `pnpm build` with:
   - `NEXT_TELEMETRY_DISABLED=1`
   - `NEXT_PUBLIC_BG_MODE=random`
   - `NEXT_PUBLIC_DEFAULT_BG=neural`
   - `NEXT_PUBLIC_ENABLE_LOGS=false`
7. Verifies `out/index.html`, `out/_next`, and `out/tools/index.html`.
8. Uploads the `site` artifact for 7 days.

The **beta** deploy job runs only for `develop` (push or manual):

1. Downloads the `site` artifact.
2. Writes the SSH key and known-hosts secret into `~/.ssh`.
3. Rsyncs `out/` to `/data/sites/beta/`.
4. Verifies the remote `index.html` exists.
5. Runs `curl -fsS https://beta.yashcodes.com/`.

The **production** deploy job runs only for `main` (push or manual):

1. Downloads the artifact.
2. Configures SSH.
3. Rsyncs `out/` to `/data/sites/production/`.
4. Verifies the remote `index.html` exists.

The production HTTPS check is commented out until the DNS cutover. Enable it
after `yashcodes.com` points to the VPS.

The `environment:` keys create GitHub environments named `beta` and
`production`. Add required reviewers under **Settings → Environments** if
production deploys should require approval.

## Required GitHub secrets

Set these once under **Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `VPS_HOST` | `152.67.67.128` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | Private key of the CI deploy key |
| `VPS_KNOWN_HOSTS` | Output of `ssh-keyscan -H 152.67.67.128` |

The workflow uses repository-level secrets, so both environments read the same
host, user, key, and known-hosts value. Use environment-level secrets only if
beta and production later move to different servers.

Never commit the private key, host key, or any other credential.

## Deploy user and permissions

The `deploy` user is deliberately narrow:

- No `sudo`.
- Not in the `docker` group.
- Shell `/bin/bash`.
- Member of `site-deploy`.
- Write access only under `/data/sites`.
- The public key is restricted with `no-pty`, `no-agent-forwarding`,
  `no-port-forwarding`, and `no-X11-forwarding`.

`/data/sites` is mounted read-only into the Caddy container as `/srv/sites`.

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
sudo install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
```

The CI public key is installed at `/home/deploy/.ssh/authorized_keys` with the
restrictions above.

The `deploy` user can write to the directories through the setgid
`site-deploy` group, but it does not own the existing `yash`-owned directories.
For that reason the workflow uses:

```bash
rsync -rlz --delete --delay-updates --chmod=D755,F644
```

It does **not** use `rsync -a`, because archive mode tries to preserve
ownership and times and fails with `Operation not permitted` on directories
owned by `yash`.

## Manual deployment

### Beta

```bash
pnpm install --frozen-lockfile
NEXT_TELEMETRY_DISABLED=1 \
NEXT_PUBLIC_BG_MODE=random \
NEXT_PUBLIC_ENABLE_LOGS=false \
pnpm build

rsync -rlz --delete --delay-updates --chmod=D755,F644 \
  -e "ssh -i ~/.ssh/portfolio-v2-deploy -o IdentitiesOnly=yes" \
  out/ deploy@152.67.67.128:/data/sites/beta/

curl -s https://beta.yashcodes.com/index.html | sha256sum
sha256sum out/index.html
```

### Production after the DNS cutover

Replace `beta` with `production` in the destination path. The same key and
user work for both directories.

## Verification

```bash
# Local build
test -s out/index.html
test -d out/_next
test -s out/tools/index.html

# Beta
curl -s -o /dev/null -w '%{http_code}\n' https://beta.yashcodes.com/
curl -s -o /dev/null -w '%{http_code}\n' https://beta.yashcodes.com/tools/
curl -s -o /dev/null -w '%{http_code}\n' https://beta.yashcodes.com/does-not-exist

# Compare the deployed page with the local build
curl -s https://beta.yashcodes.com/index.html | sha256sum
sha256sum out/index.html

# Production after cutover
curl -I https://yashcodes.com/
curl -I https://yashcodes.com/tools/
```

Expected: `/` and `/tools/` return 200, an unknown path returns 404, and the
index hashes match.

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

5. Deploy from `main`:

   ```bash
   git checkout main
   git merge --ff-only develop
   git push origin main
   ```

6. Enable the commented `Verify production` step in the workflow, then confirm:

   ```bash
   curl -I https://yashcodes.com
   curl -I https://yashcodes.com/tools/
   ```

## Rollback

The workflow keeps the built artifact for 7 days. To restore a previous
release, either revert the bad commit on the same branch and push, or download
the older artifact and sync it manually:

```bash
gh run download <run-id> -n site -D /tmp/site
rsync -rlz --delete --delay-updates --chmod=D755,F644 \
  -e "ssh -i ~/.ssh/portfolio-v2-deploy" \
  /tmp/site/ deploy@152.67.67.128:/data/sites/beta/
```

The deploy key must exist locally for a manual rollback.

Because the site is static, a rollback is a file replacement. Re-run the
workflow for the previous commit or use the artifact command above. Do not
delete or rewrite the branch history to roll back.

## Secret rotation

If the deploy key is exposed:

1. Generate a new key pair.
2. Replace `/home/deploy/.ssh/authorized_keys` on vps-1 with the new public key,
   keeping the same restrictions.
3. Run `gh secret set VPS_SSH_KEY < <new-private-key>`.
4. Remove the old private key from any local machine that no longer needs it.
5. Verify a beta deploy.

The deploy key cannot run as root, cannot use docker, and cannot write outside
`/data/sites`, but it can still modify both beta and production files. Treat it
as a deployment credential.

## Troubleshooting

### `rsync: failed to set times ... Operation not permitted`

The deploy user does not own the existing directories. Use `rsync -rlz
--chmod=D755,F644` rather than `rsync -a`. The files are deployed correctly;
only directory timestamps fail.

### `Permission denied (publickey)`

- Confirm the deploy public key is in `/home/deploy/.ssh/authorized_keys`.
- Confirm `VPS_SSH_KEY` contains the complete private key, including the
  begin/end lines.
- Confirm `VPS_USER` is `deploy`.
- Confirm `VPS_KNOWN_HOSTS` was generated for `152.67.67.128`.

### The job is queued but never starts

Check https://www.githubstatus.com/. GitHub Actions incidents can leave jobs
queued for many minutes and then mark the run failed without starting a job.
Retry with **Run workflow** after the incident clears.

### `next/font` fails while fetching DM Sans

The build fetches DM Sans from Google Fonts. A transient failure looks like:

```text
TypeError: Cannot read properties of null (reading '1')
    at .../@next/font/dist/google/loader.js
```

The workflow retries the build up to three times. If it keeps failing, re-run
the job or self-host the font with `next/font/local`.

### Caddy cannot issue a certificate for `yashcodes.com`

The A record still points elsewhere. Wait for DNS propagation, then reload
Caddy. Do not add the site block before DNS points to the VPS, because repeated
ACME failures can hit rate limits.
