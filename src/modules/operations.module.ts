import { Global, Module } from '@nestjs/common';
import { MetricsController } from '@/adapters/in/rest/controllers/metrics.controller';
import { MetricsAccessGuard } from '@/adapters/in/rest/guards/metrics-access.guard';
import { PrometheusSidecarListenerAdapter } from '@/adapters/in/metrics/prometheus-sidecar-listener.adapter';
import { PrometheusMetricsExpositionAdapter } from '@/adapters/out/metrics/prometheus-metrics-exposition.adapter';
import { RegionApiMetrics } from '@/adapters/out/metrics/region-api.metrics';
import { MetricsExpositionPort } from '@/application/ports/out/metrics-exposition.port';
import { RegionObservabilityPort } from '@/application/ports/out/region-observability.port';

@Global()
@Module({
  controllers: [MetricsController],
  providers: [
    MetricsAccessGuard,
    PrometheusSidecarListenerAdapter,
    RegionApiMetrics,
    { provide: MetricsExpositionPort, useClass: PrometheusMetricsExpositionAdapter },
    { provide: RegionObservabilityPort, useExisting: RegionApiMetrics },
  ],
  exports: [MetricsExpositionPort, RegionObservabilityPort, RegionApiMetrics],
})
export class OperationsModule {}
