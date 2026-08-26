# Wisery Academy Portal

Scaffold from the architecture plan: a Django + DRF API, a PostgreSQL
database, S3-compatible file storage (MinIO locally, Amazon S3 in AWS),
and a minimal React frontend — all wired together with one
`docker-compose.yml` that runs unchanged on a laptop, a VPS, or an AWS box.

## What's here (Phase 0)

- **backend/** — Django project. Custom `User` model with `role`
  (student / technical / editor), JWT sign-up & login, `Track` and
  `FileAsset` models matching the upload modal's draft → publish →
  visibility workflow, an `AuditLog`, and the Django admin wired up as an
  instant back office.
- **frontend/** — a deliberately minimal Vite/React app: a login screen and
  a track list, enough to prove the wiring end-to-end. The full interface
  from the design (file tables, the upload modal, progress bars) is
  Phase 2 work — see the blueprint.
- **docker-compose.yml** — proxy (Caddy), frontend, api, db (Postgres),
  storage (MinIO) + a one-shot bucket-creation step.

## Run it locally

This needs Docker Desktop running on this machine (the scaffold itself was
written from a sandboxed session that can't run Docker — see below).

```bash
cd wisery-academy-portal
cp .env.example .env
docker compose up --build
```

Then, in another terminal:

```bash
docker compose exec api python manage.py createsuperuser
docker compose exec api python manage.py seed_tracks
```

- Portal: http://localhost
- Django admin: http://localhost/admin
- MinIO console: http://localhost:9001 (login: `wisery-admin` / `wisery-admin-secret`, from `.env`)

Sign up a normal user from the portal's login screen (or via
`POST /api/auth/signup/`) — new sign-ups always land as Student. Promote
someone to Technical or Editor from the Django admin (Accounts → Users)
until the in-app "manage users" screen exists.

## Moving to AWS

Nothing in the code changes — only `.env`:

- `DATABASE_URL` → your RDS endpoint
- `S3_ENDPOINT_URL` → delete/blank it out (boto3 then talks to real S3)
- `S3_ACCESS_KEY` / `S3_SECRET_KEY` → an IAM user or role scoped to the bucket
- Drop the `db`, `storage`, and `createbuckets` services from
  `docker-compose.yml` (RDS and S3 replace them) and run `frontend` + `api`
  on ECS/Fargate or a single EC2 box behind an ALB.

See the full blueprint for the Terraform-managed pieces, the cost ballpark,
and the phased roadmap (CMS upload flow, malware scanning, SSO, VPN gating).

## Note on where this was built

This scaffold was written directly onto your Desktop through the Cowork
device bridge, which runs in a sandboxed VM without a Docker daemon — so
none of this has been `docker compose up`'d yet. That first run needs to
happen in your own terminal, with Docker Desktop installed. If anything
fails on first boot, it's most likely a missing system dependency in that
Dockerfile, not a logic error — check the container logs
(`docker compose logs api`) and it should be a quick fix.
