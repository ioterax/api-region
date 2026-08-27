import { SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';
import { setupRegionSwagger } from '@/api/swagger/api-region.config';
import { AppModule } from '@/app.module';
import { OperationsModule } from '@/modules/operations.module';
import { RegionModule } from '@/modules/region.module';

describe('Region API composition', () => {
  it('exposes Nest module metadata for authentication, operations, and region reads', () => {
    expect(AppModule).toBeDefined();
    expect(OperationsModule).toBeDefined();
    expect(RegionModule).toBeDefined();
    expect(Reflect.getMetadata('imports', AppModule)).toEqual(expect.any(Array));
    expect(Reflect.getMetadata('providers', RegionModule)).toEqual(expect.any(Array));
  });

  it('registers the private Region OpenAPI document', () => {
    const document = { openapi: '3.0.0', info: {}, paths: {} } as OpenAPIObject;
    const create = jest.spyOn(SwaggerModule, 'createDocument').mockReturnValue(document);
    const setup = jest.spyOn(SwaggerModule, 'setup').mockImplementation(() => undefined);
    const app = {} as Parameters<typeof setupRegionSwagger>[0];
    setupRegionSwagger(app);
    expect(create).toHaveBeenCalledWith(
      app,
      expect.objectContaining({ info: expect.objectContaining({ title: 'iot.EraX Region API' }) }),
      expect.objectContaining({ include: [RegionModule] }),
    );
    expect(setup).toHaveBeenCalledWith('api/region', app, document);
  });
});
