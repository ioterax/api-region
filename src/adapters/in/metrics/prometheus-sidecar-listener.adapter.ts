import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { MetricsExpositionPort } from '@/application/ports/out/metrics-exposition.port';

const LOOPBACK_HOST = '127.0.0.1';

export function parsePrometheusSidecarPort(value: string | undefined): number | undefined {
  const normalized = value?.trim();
  if (!normalized) return undefined;
  if (!/^\d+$/.test(normalized)) throw invalidPortError();
  const port = Number(normalized);
  if (!Number.isSafeInteger(port) || port < 1024 || port > 65_535) throw invalidPortError();
  return port;
}

function invalidPortError(): Error {
  return new Error('METRICS_SIDECAR_PORT must be an integer from 1024 through 65535.');
}

/** Exposes metrics only to a collector in the same Cloud Run instance. */
@Injectable()
export class PrometheusSidecarListenerAdapter
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(PrometheusSidecarListenerAdapter.name);
  private server?: Server;

  constructor(@Inject(MetricsExpositionPort) private readonly metrics: MetricsExpositionPort) {}

  async onApplicationBootstrap(): Promise<void> {
    const port = parsePrometheusSidecarPort(process.env.METRICS_SIDECAR_PORT);
    if (port === undefined) return;
    const server = createServer((request, response) => this.handle(request, response));
    this.server = server;
    try {
      await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, LOOPBACK_HOST, resolve);
      });
    } catch {
      this.server = undefined;
      throw new Error('Unable to start the Prometheus sidecar loopback listener.');
    }
    server.on('error', () => this.logger.error('The Prometheus sidecar listener failed.'));
  }

  async onApplicationShutdown(): Promise<void> {
    const server = this.server;
    this.server = undefined;
    if (!server?.listening) return;
    await new Promise<void>((resolve, reject) => {
      server.close(error =>
        error ? reject(new Error('Unable to stop metrics listener.')) : resolve(),
      );
    });
  }

  private handle(request: IncomingMessage, response: ServerResponse): void {
    if (request.url !== '/metrics') {
      this.respond(response, 404, 'Not Found\n');
      return;
    }
    if (request.method !== 'GET') {
      this.respond(response, 405, 'Method Not Allowed\n', { Allow: 'GET' });
      return;
    }
    void this.metrics
      .render()
      .then(body => this.respond(response, 200, body, { 'Content-Type': this.metrics.contentType }))
      .catch(() => this.respond(response, 503, 'Metrics temporarily unavailable\n'));
  }

  private respond(
    response: ServerResponse,
    statusCode: number,
    body: string,
    headers: Readonly<Record<string, string>> = {},
  ): void {
    response.writeHead(statusCode, {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    });
    response.end(body);
  }
}
