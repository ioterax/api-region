import { Controller, Get, Inject, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOkResponse, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import {
  ByPass,
  HeadersGuard,
  JwtAuthGuard,
  KongAuthzGuard,
  PermissionsGuard,
} from '@ioterax/security-lib-auth';
import { RegionQueryRepositoryPort } from '@/application/ports/out/region-query-repository.port';
import { RegionPersistenceUnavailableException } from '@/exceptions/region.exceptions';

@ApiTags('Operations')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
@ByPass(JwtAuthGuard, HeadersGuard, KongAuthzGuard, PermissionsGuard)
export class HealthController {
  constructor(
    @Inject(RegionQueryRepositoryPort) private readonly repository: RegionQueryRepositoryPort,
  ) {}

  @Get('live')
  @ApiOkResponse()
  live(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOkResponse()
  @ApiServiceUnavailableResponse()
  ready(): { status: 'ready' } {
    if (!this.repository.isReady()) throw new RegionPersistenceUnavailableException();
    return { status: 'ready' };
  }
}
