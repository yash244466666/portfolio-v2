# Deployment

The site is a static Next.js export. `pnpm build` writes it to `out/`.

| Branch | Environment | URL | vps-2 path | Caddy root |
|---|---|---|---|---|
| `develop` | beta | https://beta.yashcodes.com | `/opt/stacks/caddy/html/beta/` | `/srv/beta` |
| `main` | production | https://yashcodes.com | `/opt/stacks/caddy/html/production/` | `/srv/production` |

## Current status (2026-10-31)

- **The deployment target is vps-2** (`140.238.208.16`). The `deploy` user, the
  `site-deploy` group, both site directories, the SSH key, and the GitHub
  secrets are configured on vps-2.
- **Traffic has not moved yet.** `beta.yashcodes.com` still resolves to
  `152.67.67.128` (vps-1), and `yashcodes.com` still resolves to
  `103.65.138.220` (the old host). The existing sites stay online until the
  DNS records and Caddy blocks are switched.
- **The vps-2 Caddy blocks are staged and validated** in
  `/opt/stacks/caddy/Caddyfile.next`; they have not been applied to the live
  `/opt/stacks/caddy/Caddyfile`.
- **vps-1 remains intact** with the previous build and Caddy configuration as
  a rollback fallback.
- **History:** the first GitHub Actions attempts were blocked by a GitHub
  incident on 2026-10-30. One `main` build later failed on a transient Google
  Fonts fetch; the workflow now retries the build up to three times, and the
  reruns passed.

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
7. Retries the build up to three times. This covers transient
   `next/font` Google Fonts fetch failures.
8. Verifies `out/index.html`, `out/_next`, and `out/tools/index.html`.
9. Uploads the `site` artifact for 7 days.

The **beta** deploy job runs only for `develop` (push or manual):

1. Downloads the `site` artifact.
2. Writes the SSH key and known-hosts secret into `~/.ssh`.
3. Rsyncs `out/` to `/opt/stacks/caddy/html/beta/`.
4. Verifies the remote `index.html` exists.

The **production** deploy job runs only for `main` (push or manual):

1. Downloads the artifact.
2. Configures SSH.
3. Rsyncs `out/` to `/opt/stacks/caddy/html/production/`.
4. Verifies the remote `index.html` exists.

The HTTPS checks are commented out until both domains point to vps-2 and
Caddy has issued certificates. The remote file checks run in every deploy.

The `environment:` keys create GitHub environments named `beta` and
`production`. Add required reviewers under **Settings → Environments** if
production deploys should require approval.

## Required GitHub secrets

Set these once under **Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `VPS_HOST` | `140.238.208.16` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | Private key of the vps-2 CI deploy key |
| `VPS_KNOWN_HOSTS` | Output of `ssh-keyscan -H 140.238.208.16` |

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
- Write access only under `/opt/stacks/caddy/html/beta` and
  `/opt/stacks/caddy/html/production`.
- The public key is restricted with `no-pty`, `no-agent-forwarding`,
  `no-port-forwarding`, and `no-X11-forwarding`.

Because the user does not own the `yash`-owned directories, the workflow uses:

```bash
rsync -rlz --delete --delay-updates --chmod=D755,F644
```

It does **not** use `rsync -a`, because archive mode tries to preserve
ownership and times and fails with `Operation not permitted`.

## One-time vps-2 setup

Already applied on vps-2. For reference:

```bash
sudo useradd --create-home --shell /bin/bash deploy
sudo groupadd -f site-deploy
sudo usermod -aG site-deploy deploy
sudo usermod -aG site-deploy yash

sudo install -d -m 2775 -o yash -g site-deploy /opt/stacks/caddy/html/beta
sudo install -d -m 2775 -o yash -g site-deploy /opt/stacks/caddy/html/production
sudo chgrp -R site-deploy /opt/stacks/caddy/html/beta /opt/stacks/caddy/html/production
sudo chmod -R g+rwX /opt/stacks/caddy/html/beta /opt/stacks/caddy/html/production
sudo find /opt/stacks/caddy/html/beta /opt/stacks/caddy/html/production -type d -exec chmod g+s {} +

sudo install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
sudo install -d -m 755 -o root -g root /opt/stacks/caddy/data/caddy/logs
```

The CI public key is installed at `/home/deploy/.ssh/authorized_keys` with the
restrictions above.

The existing `/opt/stacks/caddy/html/index.html` (the `vps2.yashcodes.com`
page) is left untouched.

vps-2 mounts the site root read-only into Caddy:

```text
/opt/stacks/caddy/Caddyfile -> /etc/caddy/Caddyfile:ro
/opt/stacks/caddy/html      -> /srv:ro
/opt/stacks/caddy/data      -> /data
/opt/stacks/caddy/config    -> /config
```

The existing live Caddyfile has only the `vps2.yashcodes.com` block:

```caddyfile
vps2.yashcodes.com {
    root * /srv
    file_server
    encode gzip
    header {
        Strict-Transport-Security "max-age=31536000"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "no-referrer"
        Server "yashcodes"
    }
}
```

## Manual deployment

### Beta on vps-2

```bash
pnpm install --frozen-lockfile
NEXT_TELEMETRY_DISABLED=1 \
NEXT_PUBLIC_BG_MODE=random \
NEXT_PUBLIC_ENABLE_LOGS=false \
pnpm build

rsync -rlz --delete --delay-updates --chmod=D755,F644 \
  -e "ssh -i ~/.ssh/portfolio-v2-deploy-vps2 -o IdentitiesOnly=yes" \
  out/ deploy@140.238.208.16:/opt/stacks/caddy/html/beta/

ssh -i ~/.ssh/portfolio-v2-deploy-vps2 -o IdentitiesOnly=yes \
  deploy@140.238.208.16 'sha256sum /opt/stacks/caddy/html/beta/index.html'
sha256sum out/index.html
```

### Production on vps-2

Replace `beta` with `production` in the destination path. The same key and
user work for both directories.

## Verification

Before the DNS cutover, verify the deployed files on vps-2:

```bash
ssh -i ~/.ssh/portfolio-v2-deploy-vps2 -o IdentitiesOnly=yes \
  deploy@140.238.208.16 \
  'test -s /opt/stacks/caddy/html/beta/index.html && echo beta-files-ok;
   test -s /opt/stacks/caddy/html/production/index.html && echo production-files-ok'

ssh -i ~/.ssh/portfolio-v2-deploy-vps2 -o IdentitiesOnly=yes \
  deploy@140.238.208.16 \
  'du -sh /opt/stacks/caddy/html/beta /opt/stacks/caddy/html/production'
```

After the cutover, verify the served sites:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://beta.yashcodes.com/
curl -s -o /dev/null -w '%{http_code}\n' https://beta.yashcodes.com/tools/
curl -s -o /dev/null -w '%{http_code}\n' https://beta.yashcodes.com/does-not-exist
curl -I https://yashcodes.com/
curl -I https://yashcodes.com/tools/
```

Expected: `/` and `/tools/` return 200, an unknown path returns 404.

## DNS and Caddy cutover

Both records currently point elsewhere:

| Domain | Current | Target |
|---|---|---|
| `beta.yashcodes.com` | `152.67.67.128` (vps-1) | `140.238.208.16` (vps-2) |
| `yashcodes.com` | `103.65.138.220` (old host) | `140.238.208.16` (vps-2) |

### 1. Change DNS

In Dynadot, change both **A records** to `140.238.208.16` (TTL 300). Wait for
propagation:

```bash
getent ahosts beta.yashcodes.com
getent ahosts yashcodes.com
```

### 2. Apply the staged Caddyfile

The staged file `/opt/stacks/caddy/Caddyfile.next` contains the existing
`vps2.yashcodes.com` block plus the new `beta.yashcodes.com` and
`yashcodes.com` blocks. It has been validated with `caddy validate`.

```bash
cp /opt/stacks/caddy/Caddyfile /opt/stacks/caddy/Caddyfile.bak-$(date +%Y%m%d-%H%M%S)
cp /opt/stacks/caddy/Caddyfile.next /opt/stacks/caddy/Caddyfile
docker exec caddy caddy validate --config /etc/caddy/Caddyfile
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
```

If editing the live file manually instead, add these blocks.

#### Beta block

```caddyfile
beta.yashcodes.com {
    root * /srv/beta
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
    log {
        output file /data/caddy/logs/beta-access.log {
            roll_size 20mb
            roll_keep 3
            roll_keep_for 720h
        }
        format json
    }
}
```

#### Production block

```caddyfile
yashcodes.com {
    root * /srv/production
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

Caddy obtains the certificates automatically once DNS points to vps-2.
Do not add these blocks before DNS points to vps-2, because repeated ACME
failures can hit rate limits.

### 3. Enable the HTTPS checks

Uncomment the `Verify beta` and `Verify production` steps in
`.github/workflows/deploy.yml`, then push a commit or run the workflow
manually.

### 4. Verify

```bash
curl -I https://beta.yashcodes.com
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
  -e "ssh -i ~/.ssh/portfolio-v2-deploy-vps2" \
  /tmp/site/ deploy@140.238.208.16:/opt/stacks/caddy/html/beta/
```

Use `production` in the destination for the production site. The vps-2 deploy
key must exist locally for a manual rollback.

The previous vps-1 deployment is still available at `152.67.67.128` with its
own key (`~/.ssh/portfolio-v2-deploy`). It is only a fallback; the workflow no
longer deploys there.

Because the site is static, a rollback is a file replacement. Re-run the
workflow for the previous commit or use the artifact command above. Do not
delete or rewrite the branch history to roll back.

## Secret rotation

If the deploy key is exposed:

1. Generate a new key pair.
2. Replace `/home/deploy/.ssh/authorized_keys` on vps-2 with the new public key,
   keeping the same restrictions.
3. Run `gh secret set VPS_SSH_KEY < <new-private-key>`.
4. Remove the old private key from any local machine that no longer needs it.
5. Verify a beta deploy.

The deploy key cannot run as root, cannot use docker, and cannot write outside
the beta and production directories, but it can still modify both sites. Treat
it as a deployment credential.

## Troubleshooting

### `rsync: failed to set times ... Operation not permitted`

The deploy user does not own the existing directories. Use `rsync -rlz
--chmod=D755,F644` rather than `rsync -a`. The files are deployed correctly;
only directory timestamps fail.

### `Permission denied (publickey)`

- Confirm the vps-2 deploy public key is in
  `/home/deploy/.ssh/authorized_keys`.
- Confirm `VPS_SSH_KEY` contains the complete private key, including the
  begin/end lines.
- Confirm `VPS_USER` is `deploy`.
- Confirm `VPS_KNOWN_HOSTS` was generated for `140.238.208.16`.

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

### Caddy cannot issue a certificate for `yashcodes.com` or `beta.yashcodes.com`

The A record still points elsewhere. Wait for DNS propagation, then reload
Caddy. Do not add the site blocks before DNS points to vps-2, because repeated
ACME failures can hit rate limits.
