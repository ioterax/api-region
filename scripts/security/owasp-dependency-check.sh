#!/usr/bin/env bash
set -euo pipefail

dependency_check_image="${OWASP_DEPENDENCY_CHECK_IMAGE:-owasp/dependency-check:latest}"
report_dir="$PWD/reports/security/dependency-check"

mkdir -p "$report_dir"
docker run --rm \
  -v "$PWD:/src:ro" \
  -v "$report_dir:/report:rw" \
  "$dependency_check_image" \
  --project "iot.EraX api-region" \
  --scan /src/package.json \
  --scan /src/yarn.lock \
  --format HTML \
  --format JSON \
  --out /report \
  --failOnCVSS 7
