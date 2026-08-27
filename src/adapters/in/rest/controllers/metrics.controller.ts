import { Controller, Get, Header, Inject, UseGuards, VERSION_NEUTRAL } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ByPass,
  HeadersGuard,
  JwtAuthGuard,
  KongAuthzGuard,
  PermissionsGuard,
} from '@ioterax/security-lib-auth';
import { MetricsExpositionPort } from '@/application/ports/out/metrics-exposition.port';
import { MetricsAccessGuard } from '@/adapters/in/rest/guards/metrics-access.guard';
import { RegionErrorResponseModel } from '@/adapters/in/rest/models/region-response.model';

@ApiTags('Operations')
@ApiBearerAuth('metrics-service-token')
@Controller({ path: 'metrics', version: VERSION_NEUTRAL })
@ByPass(JwtAuthGuard, HeadersGuard, KongAuthzGuard, PermissionsGuard)
@UseGuards(MetricsAccessGuard)
export class MetricsController {
  constructor(@Inject(MetricsExpositionPort) private readonly metrics: MetricsExpositionPort) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @ApiOperation({ summary: 'Expose authenticated Prometheus metrics' })
  @ApiOkResponse({ content: { 'text/plain': { schema: { type: 'string' } } } })
  @ApiUnauthorizedResponse({ type: RegionErrorResponseModel })
  render(): Promise<string> {
    return this.metrics.render();
  }
}
