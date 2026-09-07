#!/bin/bash
# EC2 user-data bootstrap for Amazon Linux 2023.
# Paste this into the instance's "User data" field at launch (or run it once
# over SSH as root). It installs Docker + the Compose plugin and enables the
# service. It does NOT clone the app or start it -- do that manually after the
# box is up (see DEPLOY.md), so secrets never live in user-data.
set -euo pipefail

dnf update -y
dnf install -y docker git
systemctl enable --now docker

# Let the default login user run docker without sudo (log out/in to take effect).
usermod -aG docker ec2-user || true

# Docker Compose v2 plugin (pinned; bump as needed).
COMPOSE_VERSION="v2.29.7"
mkdir -p /usr/local/lib/docker/cli-plugins
curl -fsSL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

docker --version
docker compose version
echo "Bootstrap complete. Next: clone the repo, create .env, then 'docker compose ... up -d'. See DEPLOY.md."
