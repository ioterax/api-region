import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RegionModule } from '@/modules/region.module';
import {
  AdministrativeDivisionPageResponseModel,
  AdministrativeDivisionResponseModel,
  CountryPageResponseModel,
  GeographicPlacePageResponseModel,
  GeographicPlaceResponseModel,
  GlobalCountryResponseModel,
  RegionCatalogResponseModel,
  RegionErrorResponseModel,
  RegionReleaseResponseModel,
  RegionSearchPageResponseModel,
} from '@/adapters/in/rest/models/region-response.model';

/** Registers the private BFF-facing Region API OpenAPI document. */
export function setupRegionSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('iot.EraX Region API')
    .setDescription(
      [
        'Private read-only API for countries, administrative divisions, and places.',
        '',
        'Only records referenced by the atomic active global dataset catalog are visible.',
        'Frontend applications consume these contracts through the iot.EraX BFF.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addTag('Global regions', 'Governed global geography read models')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'iot.EraX BFF or technical-service access token',
      },
      'Authorization',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        description: 'Dedicated Prometheus scrape credential',
      },
      'metrics-service-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, options, {
    include: [RegionModule],
    extraModels: [
      CountryPageResponseModel,
      GlobalCountryResponseModel,
      AdministrativeDivisionPageResponseModel,
      AdministrativeDivisionResponseModel,
      GeographicPlacePageResponseModel,
      GeographicPlaceResponseModel,
      RegionSearchPageResponseModel,
      RegionCatalogResponseModel,
      RegionReleaseResponseModel,
      RegionErrorResponseModel,
    ],
  });
  SwaggerModule.setup('api/region', app, document);
}
