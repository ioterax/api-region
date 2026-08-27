import { Module } from '@nestjs/common';
import { MapperModule } from '@ioterax/infra-lib-mapper';
import { HealthController } from '@/adapters/in/rest/controllers/health.controller';
import { RegionController } from '@/adapters/in/rest/controllers/region.controller';
import { RegionRestAdapter } from '@/adapters/in/rest/region-rest.adapter';
import { RegionRestMapper } from '@/adapters/in/rest/mappers/region-rest.mapper';
import { RegionRestInPort } from '@/adapters/in/rest/ports/region-rest-in.port';
import { MongoRegionQueryRepository } from '@/adapters/out/mongodb/mongo-region-query.repository';
import { RegionPersistenceMapper } from '@/adapters/out/mongodb/mappers/region-persistence.mapper';
import { RegionQueryInPort } from '@/application/ports/in/region-query.port';
import { RegionQueryRepositoryPort } from '@/application/ports/out/region-query-repository.port';
import { RegionQueryService } from '@/application/service/region-query.service';
import { REGION_API_CONFIGURATION, loadRegionApiConfiguration } from '@/infra/runtime.config';

@Module({
  imports: [MapperModule.register([RegionRestMapper, RegionPersistenceMapper])],
  controllers: [HealthController, RegionController],
  providers: [
    { provide: REGION_API_CONFIGURATION, useFactory: loadRegionApiConfiguration },
    RegionRestAdapter,
    MongoRegionQueryRepository,
    RegionQueryService,
    { provide: RegionRestInPort, useExisting: RegionRestAdapter },
    { provide: RegionQueryInPort, useExisting: RegionQueryService },
    { provide: RegionQueryRepositoryPort, useExisting: MongoRegionQueryRepository },
  ],
  exports: [RegionQueryRepositoryPort],
})
export class RegionModule {}
