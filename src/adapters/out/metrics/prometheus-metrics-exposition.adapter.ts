import { collectDefaultMetrics, register } from '@prometheus-io/client';
import { MetricsExpositionPort } from '@/application/ports/out/metrics-exposition.port';

const RUNTIME_METRIC_SENTINEL = 'ioterax_process_cpu_user_seconds_total';

/** Owns process metric initialization and Prometheus text exposition. */
export class PrometheusMetricsExpositionAdapter extends MetricsExpositionPort {
  readonly contentType = register.contentType;

  constructor() {
    super();
    if (!register.getSingleMetric(RUNTIME_METRIC_SENTINEL)) {
      collectDefaultMetrics({ prefix: 'ioterax_' });
    }
  }

  render(): Promise<string> {
    return register.metrics();
  }
}
