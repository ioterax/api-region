# iot.EraX Region API

[![Required microservice CI](https://github.com/ioterax/api-region/actions/workflows/production.yml/badge.svg?branch=develop)](https://github.com/ioterax/api-region/actions/workflows/production.yml)
[![Node.js](https://img.shields.io/badge/Node.js-26.6.0-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Yarn](https://img.shields.io/badge/Yarn-4.18.0-2C8EBB?logo=yarn&logoColor=white)](https://yarnpkg.com/)
[![Plug'n'Play](https://img.shields.io/badge/dependencies-strict%20PnP-2C8EBB)](https://yarnpkg.com/features/pnp)
[![Coverage](https://img.shields.io/badge/coverage-%E2%89%A591%25-brightgreen)](./package.json)

Private read-only iot.EraX API for governed global countries, administrative divisions, and places. Frontend applications consume it through `ioterax-bff`; it is not a public browser-facing service.

## Responsibilities

- Read normalized global geography from MongoDB database `foundation_central`.
- Expose only records referenced by the atomic `region_dataset_catalogs/global` pointer.
- Provide bounded country, division, place, localized search, catalog, and release queries.
- Preserve dataset provenance without exposing MongoDB implementation fields.
- Enforce shared `RegionCountryPermissions.VIEW_LIST` and `VIEW_GET` permissions.
- Publish bounded technical and business Prometheus metrics.

The companion [`worker-region`](https://github.com/ioterax/worker-region) repository owns ingestion, immutable release staging, validation, checkpointing, and catalog activation. This service never mutates region data.

## Architecture

```text
src/
├── domain/                 query commands and transport-neutral results
├── application/
│   ├── ports/in/           read-only use-case boundary
│   ├── ports/out/          MongoDB and observability boundaries
│   └── service/            query orchestration and business metrics
├── adapters/
│   ├── in/rest/            strict DTOs, controllers, REST adapter, presentation mapper
│   ├── in/metrics/         loopback-only collector listener
│   └── out/                MongoDB mapper/repository and Prometheus adapter
├── infra/                  fail-closed runtime config and query index contracts
├── modules/                NestJS composition
└── scripts/                explicit index migration entry point
```

The execution flow is `Controller → REST adapter → use case → repository port → MongoDB adapter`. Persistence documents are mapped into public `@ioterax/foundation-lib-central` contracts before presentation mapping.

## HTTP API

All business routes use URI version `v1` and require the iot.EraX authentication, request-context, Kong authorization, and shared RBAC guards.

| Method | Route                                     | Permission                 |
| ------ | ----------------------------------------- | -------------------------- |
| `GET`  | `/v1/region/countries`                    | `region.country.view.list` |
| `GET`  | `/v1/region/countries/:id`                | `region.country.view.get`  |
| `GET`  | `/v1/region/administrative-divisions`     | `region.country.view.list` |
| `GET`  | `/v1/region/administrative-divisions/:id` | `region.country.view.get`  |
| `GET`  | `/v1/region/places`                       | `region.country.view.list` |
| `GET`  | `/v1/region/places/:id`                   | `region.country.view.get`  |
| `GET`  | `/v1/region/search`                       | `region.country.view.list` |
| `GET`  | `/v1/region/catalog`                      | `region.country.view.get`  |
| `GET`  | `/v1/region/releases/active`              | `region.country.view.list` |

OpenAPI is available at `/api/region` inside the private service boundary. Pagination defaults to 25 records and is capped at 100 per request.

## Runtime configuration

Copy `.env.example` only for local development. Never commit credentials.

| Variable                            | Requirement                                           |
| ----------------------------------- | ----------------------------------------------------- |
| `MONGODB_URI` or `MONGODB_URI_FILE` | Exactly one MongoDB credential source                 |
| `MONGODB_DATABASE`                  | Must be `foundation_central`                          |
| `JWT_PUBLIC_KEY_PATH`               | Mounted RS256 public key used by shared auth guards   |
| `METRICS_BEARER_TOKEN`              | Dedicated credential for ingress `GET /metrics`       |
| `METRICS_SIDECAR_PORT`              | Optional loopback listener for a co-located collector |
| `PORT` / `LISTEN_PORT`              | Cloud Run port; default `3903`                        |

The application never logs MongoDB URIs, tokens, keys, request bodies, or tenant identifiers.

## Development

Use Node.js `26.6.0` and Yarn `4.18.0` with strict Plug'n'Play:

```bash
corepack enable
yarn install --immutable
yarn quality
yarn test:e2e
```

There is no `node_modules` directory. The E2E suite requires Docker and starts an isolated MongoDB container.

The root Hub Platform development Compose integration is added only after the service delivery is merged, so repository deployment and local orchestration remain independently governed.

## Query indexes

Ordinary service startup never creates, changes, or drops indexes. Plan first with read-only credentials, review the deterministic report, then use the dedicated migration identity to apply:

```bash
yarn indexes:plan
yarn indexes:apply
```

The API owns only read-query and localized text indexes. `worker-region` owns ingestion and persistence lifecycle indexes.

## Metrics and health

- `/health/live` reports process liveness.
- `/health/ready` fails closed until MongoDB is connected.
- `/metrics` bypasses user guards but requires `METRICS_BEARER_TOKEN`.
- An optional `127.0.0.1` listener exposes `/metrics` only to a co-located collector.

Business metrics use bounded labels:

- `ioterax_region_queries_total`
- `ioterax_region_query_duration_seconds`
- `ioterax_region_query_result_items`
- `ioterax_region_database_operations_total`
- `ioterax_mongodb_connection_ready`

Raw URLs, request or trace IDs, company/user identifiers, tokens, and arbitrary error text are never metric labels.

## Security and delivery

CI enforces immutable PnP installation, build, lint, type checking, at least 91% statement/branch/function/line coverage, MongoDB E2E tests, documentation, dependency checks, a non-root distroless runtime, and Trivy image scanning. High/critical and fixable medium vulnerabilities fail delivery unless a narrowly reviewed, expiring exception is committed.

The runtime base is pinned by digest. Until the upstream distroless Debian 13 digest includes the current OpenSSL security update, the Docker build overlays the exact signed `libssl3t64` security package and its package metadata. Remove that overlay only after pinning and scanning a clean replacement digest; never convert it into a Trivy exception.

The following suites are manual-only and are never invoked by ordinary CI:

```bash
yarn test:mutation
yarn test:pentest
yarn test:security:owasp
```

Terraform and HCP Terraform own the Cloud Run service shell, IAM, ingress, scaling, identities, and Secret Manager containers. GitHub Actions owns immutable images, reviewed secret versions, revisions, traffic promotion, and rollback.

See [architecture](docs/architecture.md) and the [operations runbook](docs/operations-runbook.md).
