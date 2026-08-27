export type RegionQueryResource =
  'country' | 'administrative_division' | 'place' | 'search' | 'catalog' | 'release';
export type RegionQueryOperation = 'list' | 'get' | 'search';
export type RegionQueryOutcome = 'accepted' | 'rejected';
export type RegionQueryReason =
  'success' | 'not_found' | 'catalog_unavailable' | 'data_invalid' | 'persistence_unavailable';

/** Bounded observability boundary. Values must never contain caller or tenant data. */
export abstract class RegionObservabilityPort {
  abstract recordQuery(
    resource: RegionQueryResource,
    operation: RegionQueryOperation,
    outcome: RegionQueryOutcome,
    reason: RegionQueryReason,
    durationSeconds: number,
    resultItems: number,
  ): void;
  abstract recordDatabaseOperation(
    operation: 'connect' | 'read',
    outcome: 'success' | 'failure',
    durationSeconds: number,
  ): void;
  abstract recordMongoConnection(event: 'connected' | 'disconnected' | 'error'): void;
}
