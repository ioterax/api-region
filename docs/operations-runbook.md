# Region API operations runbook

## Readiness failure

1. Confirm `/health/live` responds and `/health/ready` fails.
2. Inspect bounded connection metrics through the approved Prometheus path.
3. Verify the reviewed MongoDB Secret Manager version is mounted into the current revision.
4. Verify the runtime identity has read-only access to `foundation_central`.
5. Roll back through the GitHub Actions release workflow if the failure began with a revision.

Never print, copy into an issue, or pass a MongoDB URI on a command line that can be logged.

## Catalog unavailable

`REGION_CATALOG_UNAVAILABLE` means the `global` pointer is missing or contains no active release. Do not manually edit it. Inspect the latest `worker-region` Job execution and its immutable manifest/checksum, then resume the governed ingestion process. A failed or staged release must never be made visible by changing API filters.

## Index migration

1. Use a read-only credential and run `yarn indexes:plan`.
2. Review collection, stable index name, action, and reason.
3. Use the dedicated migration identity only after approval.
4. Run `yarn indexes:apply` once.
5. Re-run the plan and require no missing action.

The API does not reconcile indexes during startup. Do not grant index-management permission to its runtime identity.

## Metrics scrape

Prefer the optional loopback listener with a co-located collector. If ingress `/metrics` is used, store its bearer credential in Secret Manager and rotate it independently from user JWTs and API keys. Missing credentials must fail closed.

## Rollback

Terraform retains ownership of the service shell. Rollback application code by promoting a previously attested immutable image revision through GitHub Actions. Do not alter Cloud Run traffic, ingress, IAM, scaling, or secrets directly in the Cloud Console or with ad hoc `gcloud` commands.

## Runtime base security update

The Dockerfile temporarily overlays an exact Debian Security `libssl3t64` package because the pinned distroless Debian 13 digest still contains a fixable high-severity OpenSSL advisory. When distroless publishes a corrected digest:

1. Pin the replacement digest in the Dockerfile.
2. Build both `stable` and `dev` dependency-channel images.
3. Run the high/critical and fixable-medium Trivy gates.
4. Remove the package overlay only when both images remain clean.

Fail the build if the exact security package becomes unavailable. Do not loosen the version or add the advisory to `.trivyignore.yaml` without a separate reviewed risk decision and expiry.
