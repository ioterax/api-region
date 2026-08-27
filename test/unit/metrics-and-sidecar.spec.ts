import { createServer, type Server } from 'node:http';
import { Counter, Gauge, register } from '@prometheus-io/client';
import { MetricsController } from '@/adapters/in/rest/controllers/metrics.controller';
import {
  parsePrometheusSidecarPort,
  PrometheusSidecarListenerAdapter,
} from '@/adapters/in/metrics/prometheus-sidecar-listener.adapter';
import { PrometheusMetricsExpositionAdapter } from '@/adapters/out/metrics/prometheus-metrics-exposition.adapter';
import { RegionApiMetrics } from '@/adapters/out/metrics/region-api.metrics';
import type { MetricsExpositionPort } from '@/application/ports/out/metrics-exposition.port';

describe('RegionApiMetrics', () => {
  beforeEach(() => register.clear());
  afterAll(() => register.clear());

  it('records bounded query, database, and connection metrics', async () => {
    const metrics = new RegionApiMetrics();
    metrics.recordQuery('country', 'list', 'accepted', 'success', 0.01, 2);
    metrics.recordDatabaseOperation('read', 'success', 0.02);
    metrics.recordMongoConnection('connected');
    metrics.recordMongoConnection('error');
    metrics.recordMongoConnection('disconnected');
    const output = await register.metrics();
    expect(output).toContain('ioterax_region_queries_total');
    expect(output).toContain('ioterax_region_database_operations_total');
    expect(output).toContain('ioterax_mongodb_connection_ready');
  });

  it('reuses compatible process-wide metrics', () => {
    expect(() => {
      new RegionApiMetrics();
      new RegionApiMetrics();
    }).not.toThrow();
  });

  it('rejects incompatible metric types, contracts, and buckets', () => {
    new Gauge({
      name: 'ioterax_region_queries_total',
      help: 'wrong',
      labelNames: ['resource', 'operation', 'outcome', 'reason'],
    });
    expect(() => new RegionApiMetrics()).toThrow('incompatible type');
    register.clear();
    new Counter({
      name: 'ioterax_region_queries_total',
      help: 'wrong',
      labelNames: ['resource', 'operation', 'outcome', 'reason'],
    });
    expect(() => new RegionApiMetrics()).toThrow('incompatible contract');
  });

  it('keeps telemetry failures from changing a business outcome', () => {
    const metrics = new RegionApiMetrics();
    const counter = metrics as unknown as {
      queries: { inc: () => void };
    };
    counter.queries.inc = () => {
      throw new Error('telemetry failure');
    };
    expect(() =>
      metrics.recordQuery('search', 'search', 'accepted', 'success', 0, 0),
    ).not.toThrow();
  });
});

describe('Prometheus metrics exposition', () => {
  beforeEach(() => register.clear());
  afterAll(() => register.clear());

  it('initializes default metrics once and renders them through the controller', async () => {
    const exposition = new PrometheusMetricsExpositionAdapter();
    const second = new PrometheusMetricsExpositionAdapter();
    const controller = new MetricsController(exposition);
    expect(exposition.contentType).toContain('text/plain');
    await expect(controller.render()).resolves.toContain('ioterax_process_cpu_user_seconds_total');
    await expect(second.render()).resolves.toContain('ioterax_process_cpu_user_seconds_total');
  });
});

describe('PrometheusSidecarListenerAdapter', () => {
  const originalPort = process.env.METRICS_SIDECAR_PORT;

  afterEach(() => {
    if (originalPort === undefined) delete process.env.METRICS_SIDECAR_PORT;
    else process.env.METRICS_SIDECAR_PORT = originalPort;
  });

  it('parses only an optional unprivileged TCP port', () => {
    expect(parsePrometheusSidecarPort(undefined)).toBeUndefined();
    expect(parsePrometheusSidecarPort(' 3904 ')).toBe(3904);
    expect(() => parsePrometheusSidecarPort('abc')).toThrow('METRICS_SIDECAR_PORT');
    expect(() => parsePrometheusSidecarPort('80')).toThrow('METRICS_SIDECAR_PORT');
    expect(() => parsePrometheusSidecarPort('70000')).toThrow('METRICS_SIDECAR_PORT');
  });

  it('serves only GET /metrics on loopback and closes cleanly', async () => {
    const port = await availablePort();
    process.env.METRICS_SIDECAR_PORT = String(port);
    const exposition = {
      contentType: 'text/plain; version=0.0.4',
      render: jest.fn().mockResolvedValue('region_metric 1\n'),
    } as unknown as jest.Mocked<MetricsExpositionPort>;
    const listener = new PrometheusSidecarListenerAdapter(exposition);
    await listener.onApplicationBootstrap();
    await expect(
      fetch(`http://127.0.0.1:${port}/metrics`).then(response => response.text()),
    ).resolves.toBe('region_metric 1\n');
    expect((await fetch(`http://127.0.0.1:${port}/missing`)).status).toBe(404);
    expect((await fetch(`http://127.0.0.1:${port}/metrics`, { method: 'POST' })).status).toBe(405);
    exposition.render.mockRejectedValueOnce(new Error('unavailable'));
    expect((await fetch(`http://127.0.0.1:${port}/metrics`)).status).toBe(503);
    await listener.onApplicationShutdown();
    await listener.onApplicationShutdown();
  });

  it('does nothing without a sidecar port and fails on a port collision', async () => {
    delete process.env.METRICS_SIDECAR_PORT;
    const exposition = {
      contentType: 'text/plain',
      render: jest.fn().mockResolvedValue('ok'),
    } as unknown as jest.Mocked<MetricsExpositionPort>;
    const listener = new PrometheusSidecarListenerAdapter(exposition);
    await listener.onApplicationBootstrap();
    await listener.onApplicationShutdown();

    const occupied = createServer();
    const port = await listen(occupied, 0);
    process.env.METRICS_SIDECAR_PORT = String(port);
    await expect(listener.onApplicationBootstrap()).rejects.toThrow('Unable to start');
    await close(occupied);
  });
});

async function availablePort(): Promise<number> {
  const server = createServer();
  const port = await listen(server, 0);
  await close(server);
  return port;
}

async function listen(server: Server, port: number): Promise<number> {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('TCP test server has no port');
  return address.port;
}

async function close(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close(error => (error ? reject(error) : resolve()));
  });
}
