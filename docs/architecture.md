# Region API architecture

## Boundary

`api-region` is the read side of the iot.EraX global geography capability. `worker-region` is the write side. They share public domain contracts from `@ioterax/foundation-lib-central` and MongoDB collection names, but they do not share microservice source code.

Frontend applications call `ioterax-bff`. The BFF propagates the authenticated actor, effective company tenant, permissions, correlation context, API key, and language to the private Region API. The Cloud Run service must use internal ingress and grant invocation only to approved service identities.

## Consistency model

Every entity is immutable within a dataset release. The worker stages a release under its `datasetReleaseId`, verifies record counts, and atomically replaces `region_dataset_catalogs/global`. The API resolves that pointer for every repository operation and includes `datasetReleaseId: { $in: activeReleaseIds }` in all entity filters. Staged, failed, and superseded records cannot leak merely because they remain physically present.

```text
worker-region                         api-region
     │                                    │
     ├─ stage release-scoped records      │
     ├─ validate counts                   │
     └─ atomically activate catalog ──────┤
                                          ├─ resolve activeReleaseIds
                                          ├─ filter every query
                                          └─ map persistence → domain → REST
```

## Collections

- `global_countries`
- `administrative_divisions`
- `geographic_places`
- `region_dataset_releases`
- `region_dataset_catalogs`

MongoDB `_id` and the worker-only GeoJSON helper are never returned. Response models are explicit allowlists built from the shared global geography contracts.

## Search

Search uses MongoDB text indexes on canonical and localized names. The API migration owns those query indexes and supporting filtered-sort indexes. Search is bounded to three finite resource kinds, optional ISO alpha-2 scope, at most 100 results per page, and at most 1,000 pages. The service performs deterministic cross-collection ordering by text score, name, kind, and stable ID.

## Security

There are no mutation routes. Business endpoints use shared JWT, mandatory header, Kong authorization, and permissions guards. Controllers reference only `RegionCountryPermissions` constants from `@ioterax/security-lib-rbac`.

The normal `/metrics` surface uses a separate timing-safe bearer-token guard. A second listener can bind only to `127.0.0.1` for a co-located managed Prometheus collector. Health endpoints expose only bounded state and no dependency details.

## Ownership

- `foundation-lib-central`: public geography and dataset contracts.
- `worker-region`: ingestion, release lifecycle, checkpoints, activation, write indexes.
- `api-region`: read use cases, query indexes, response projections, query metrics.
- `ioterax-bff`: frontend-facing facade and context propagation.
- `ioterax-terraformer`: production Cloud Run shell, IAM, secrets, networking, and observability infrastructure.
