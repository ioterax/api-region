import { Injectable } from '@nestjs/common';
import { Counter, Gauge, Histogram, register } from '@prometheus-io/client';
import {
  RegionObservabilityPort,
  type RegionQueryOperation,
  type RegionQueryOutcome,
  type RegionQueryReason,
  type RegionQueryResource,
} from '@/application/ports/out/region-observability.port';

interface MetricContract {
  help?: string;
  labelNames?: string[];
}

/** Process-wide technical and business metrics with finite non-sensitive labels. */
@Injectable()
export class RegionApiMetrics extends RegionObservabilityPort {
  private readonly queries: Counter<'resource' | 'operation' | 'outcome' | 'reason'>;
  private readonly queryDuration: Histogram<'resource' | 'operation' | 'outcome'>;
  private readonly resultItems: Histogram<'resource' | 'operation'>;
  private readonly databaseOperations: Counter<'operation' | 'outcome'>;
  private readonly databaseDuration: Histogram<'operation' | 'outcome'>;
  private readonly mongoReady: Gauge<'connection'>;
  private readonly mongoEvents: Counter<'connection' | 'event'>;

  constructor() {
    super();
    this.queries = this.counter(
      'ioterax_region_queries_total',
      'Total global region queries by bounded resource, operation, outcome, and reason',
      ['resource', 'operation', 'outcome', 'reason'],
    );
    this.queryDuration = this.histogram(
      'ioterax_region_query_duration_seconds',
      'Global region query duration in seconds',
      ['resource', 'operation', 'outcome'],
      [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    );
    this.resultItems = this.histogram(
      'ioterax_region_query_result_items',
      'Distribution of records returned by global region queries',
      ['resource', 'operation'],
      [0, 1, 2, 5, 10, 25, 50, 100],
    );
    this.databaseOperations = this.counter(
      'ioterax_region_database_operations_total',
      'Total Region API database operations by bounded outcome',
      ['operation', 'outcome'],
    );
    this.databaseDuration = this.histogram(
      'ioterax_region_database_operation_duration_seconds',
      'Region API database operation duration in seconds',
      ['operation', 'outcome'],
      [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    );
    this.mongoReady = this.gauge(
      'ioterax_mongodb_connection_ready',
      'Whether the Region API MongoDB connection is ready',
      ['connection'],
    );
    this.mongoEvents = this.counter(
      'ioterax_mongodb_connection_events_total',
      'Total Region API MongoDB connection lifecycle events',
      ['connection', 'event'],
    );
    this.mongoReady.set({ connection: 'foundation_central' }, 0);
  }

  recordQuery(
    resource: RegionQueryResource,
    operation: RegionQueryOperation,
    outcome: RegionQueryOutcome,
    reason: RegionQueryReason,
    durationSeconds: number,
    resultItems: number,
  ): void {
    this.safeRecord(() => {
      this.queries.inc({ resource, operation, outcome, reason });
      this.queryDuration.observe({ resource, operation, outcome }, durationSeconds);
      this.resultItems.observe({ resource, operation }, resultItems);
    });
  }

  recordDatabaseOperation(
    operation: 'connect' | 'read',
    outcome: 'success' | 'failure',
    durationSeconds: number,
  ): void {
    this.safeRecord(() => {
      this.databaseOperations.inc({ operation, outcome });
      this.databaseDuration.observe({ operation, outcome }, durationSeconds);
    });
  }

  recordMongoConnection(event: 'connected' | 'disconnected' | 'error'): void {
    this.safeRecord(() => {
      this.mongoEvents.inc({ connection: 'foundation_central', event });
      this.mongoReady.set({ connection: 'foundation_central' }, event === 'connected' ? 1 : 0);
    });
  }

  private counter<Label extends string>(
    name: string,
    help: string,
    labelNames: readonly Label[],
  ): Counter<Label> {
    const existing = register.getSingleMetric(name);
    if (existing) {
      if (!(existing instanceof Counter))
        throw new Error(`Metric ${name} has an incompatible type`);
      this.assertContract(existing, name, help, labelNames);
      return existing;
    }
    return new Counter({ name, help, labelNames: [...labelNames] });
  }

  private gauge<Label extends string>(
    name: string,
    help: string,
    labelNames: readonly Label[],
  ): Gauge<Label> {
    const existing = register.getSingleMetric(name);
    if (existing) {
      if (!(existing instanceof Gauge)) throw new Error(`Metric ${name} has an incompatible type`);
      this.assertContract(existing, name, help, labelNames);
      return existing;
    }
    return new Gauge({ name, help, labelNames: [...labelNames] });
  }

  private histogram<Label extends string>(
    name: string,
    help: string,
    labelNames: readonly Label[],
    buckets: readonly number[],
  ): Histogram<Label> {
    const existing = register.getSingleMetric(name);
    if (existing) {
      if (!(existing instanceof Histogram)) {
        throw new Error(`Metric ${name} has an incompatible type`);
      }
      this.assertContract(existing, name, help, labelNames);
      const contract = existing as unknown as { upperBounds: number[] };
      if (
        contract.upperBounds.length !== buckets.length ||
        !contract.upperBounds.every((bucket, index) => bucket === buckets[index])
      ) {
        throw new Error(`Metric ${name} has incompatible buckets`);
      }
      return existing;
    }
    return new Histogram({ name, help, labelNames: [...labelNames], buckets: [...buckets] });
  }

  private assertContract(
    metric: unknown,
    name: string,
    help: string,
    labels: readonly string[],
  ): void {
    const contract = metric as MetricContract;
    if (
      contract.help !== help ||
      contract.labelNames?.length !== labels.length ||
      !contract.labelNames.every((label, index) => label === labels[index])
    ) {
      throw new Error(`Metric ${name} has an incompatible contract`);
    }
  }

  private safeRecord(action: () => void): void {
    try {
      action();
    } catch {
      // Observability must never change a region query result.
    }
  }
}
