# Deploying to a single AWS EC2 instance

This is the **all-in-one** deployment: one EC2 box runs the whole stack in
Docker — Caddy (TLS + reverse proxy), the React frontend, the Django API,
Postgres, and MinIO (file storage). Nothing else in AWS is required. It's the
simplest and cheapest way to stand the portal up for internal / demo use.

> Data (the database and all uploaded files) lives on the instance's disk, in
> Docker volumes. That makes the box **stateful** — back up the disk (see
> [Backups](#backups)). When you outgrow one box, the upgrade path is RDS +
> S3 (see [Scaling up later](#scaling-up-later)).

---

## What to ask your DevOps / infrastructure team

Hand them this list. Everything here is standard AWS; none of it needs custom
IAM because the app talks to no AWS services in this setup.

**1. One EC2 instance**
- **Type:** `t3.medium` (2 vCPU, 4 GB RAM) recommended. `t3.small` (2 GB) is
  the bare minimum for a light demo. It runs 6 containers including Postgres
  and MinIO, so don't go below 2 GB.
- **OS:** Amazon Linux 2023 (the bootstrap script targets it) or Ubuntu 22.04/24.04 LTS.
- **Root disk:** 30–50 GB `gp3` EBS. **Uploaded files and the database live on
  this disk**, so size it for the content you expect (decks/videos add up).

**2. A static public address**
- An **Elastic IP** associated with the instance, so the address survives
  stop/start and DNS can point at it.

**3. Security group (firewall) — inbound rules**
| Port | Protocol | Source | Why |
|------|----------|--------|-----|
| 80   | TCP | `0.0.0.0/0` | HTTP (and Let's Encrypt validation) |
| 443  | TCP | `0.0.0.0/0` | HTTPS |
| 22   | TCP | **your office / VPN IP only** | SSH admin |

Do **not** open anything else. Postgres (5432) and MinIO (9000/9001) are never
exposed — they're internal to the box.

**4. DNS (only if you want HTTPS + a clean URL)**
- An **A record** — e.g. `portal.wiserylabs.ai` → the Elastic IP.
- With a domain, Caddy provisions HTTPS automatically. Without one, you run on
  the EC2 public DNS over plain HTTP for now.

**5. Outbound internet from the instance**
- Needed to pull Docker images and obtain TLS certificates. (A default VPC with
  an internet gateway covers this.)

**6. Software**
- Docker + Docker Compose plugin. Use [`deploy/ec2-userdata.sh`](deploy/ec2-userdata.sh)
  as the instance **User data** to install these at launch, or have DevOps
  install them.

**7. How the code reaches the box**
- Decide one: (a) `git clone` the repo on the instance (needs a deploy key /
  read access), or (b) build images in CI and pull them. This guide assumes (a).

**8. Backups**
- A schedule of **EBS snapshots** of the root volume (captures Postgres + the
  MinIO files + certs). Daily is a reasonable start.

---

## First-time deploy

SSH onto the instance, then:

```bash
# 1. Get the code
git clone <your-repo-url> wisery-academy-portal
cd wisery-academy-portal

# 2. Create the production env file from the template and fill it in
cp .env.production.example .env
#   - set DEBUG=False
#   - generate DJANGO_SECRET_KEY:  python3 -c "import secrets; print(secrets.token_urlsafe(50))"
#   - set strong POSTGRES_PASSWORD / S3_ACCESS_KEY / S3_SECRET_KEY
#   - set ALLOWED_HOSTS / CORS_ALLOWED_ORIGINS / CSRF_TRUSTED_ORIGINS / SITE_ADDRESS
nano .env

# 3. Build and start the whole stack
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

The API container runs database migrations and `collectstatic` automatically on
start. Give it a minute, then:

```bash
# 4. Create your real admin (instead of the demo accounts)
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec api \
  python manage.py createsuperuser
```

Open the site:
- **With a domain:** `https://portal.example.com`
- **IP-only:** `http://<ec2-public-dns>`

> **Tip:** the two `-f` flags are needed on every `docker compose` command for
> the prod overrides to apply. To avoid repeating them, set once per shell:
> `export COMPOSE_FILE=docker-compose.yml:docker-compose.prod.yml` — then plain
> `docker compose up -d` uses both.

### Optional: load the demo content
For a showcase box, you can seed the six tracks + example files + the three demo
role accounts instead of starting empty:

```bash
docker compose exec api python manage.py seed_demo
```

Skip this for a real production instance and add content through the Editor UI.

---

## HTTPS / domain

Set `SITE_ADDRESS` in `.env`:
- `SITE_ADDRESS=portal.example.com` → Caddy obtains and auto-renews a Let's
  Encrypt certificate and serves HTTPS on 443, redirecting HTTP → HTTPS.
- `SITE_ADDRESS=:80` (or unset) → plain HTTP on 80, good for an IP-only demo.

The A record must resolve to the instance **before** you start with a domain, so
Caddy can complete the ACME challenge. To switch an existing box from IP to
domain: point DNS, edit `SITE_ADDRESS`, then
`docker compose ... up -d` (recreates the proxy).

---

## Updating to a new version

```bash
cd wisery-academy-portal
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Migrations run automatically on the api container's start. Data in the Postgres
and MinIO volumes is preserved across rebuilds.

---

## Backups

Data lives in the `db_data` and `storage_data` Docker volumes on the root EBS
disk. Two options:
- **Simplest:** scheduled **EBS snapshots** of the root volume (set up by DevOps).
- **Logical DB dump** (portable):
  ```bash
  docker compose exec db pg_dump -U wisery wisery_academy > backup-$(date +%F).sql
  ```
  MinIO files are under the `storage_data` volume; snapshot the disk to capture them.

---

## Scaling up later (RDS + S3)

Nothing in the code changes — only `.env` and which services you run:
- Point `DATABASE_URL` at an RDS Postgres endpoint and drop the `db` service.
- Create an S3 bucket, **blank out `S3_ENDPOINT_URL`** (boto3 then talks to real
  S3), set `S3_ACCESS_KEY`/`S3_SECRET_KEY` to an IAM user/role scoped to the
  bucket, and drop the `storage` + `createbuckets` services.
- Downloads already stream through the API, so no bucket needs to be public.

---

## Troubleshooting

- **`Bad Request (400)` on every page:** `ALLOWED_HOSTS` doesn't include the host
  you're using. Add the domain / EC2 DNS and recreate the api container.
- **Admin login fails with a CSRF error over HTTPS:** ensure
  `CSRF_TRUSTED_ORIGINS=https://your-host` is set.
- **Certificate not issued:** DNS must point at the box and ports 80 **and** 443
  must be open to the internet. Check `docker compose logs proxy`.
- **See what's running / logs:**
  ```bash
  docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
  docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f api
  ```
