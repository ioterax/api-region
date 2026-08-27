import { bootstrapMicroservice, SiloCtxEnum } from '@ioterax/bootstrap-lib-starter';
import { AppModule } from '@/app.module';
import { setupRegionSwagger } from '@/api/swagger/api-region.config';
import { loadRegionApiConfiguration } from '@/infra/runtime.config';

const configuration = loadRegionApiConfiguration();

void bootstrapMicroservice({
  appModule: AppModule,
  serviceName: 'Region API',
  banner: 'iot.EraX Region API',
  enableGrpc: false,
  port: configuration.port,
  swagger: [setupRegionSwagger],
  siloContext: (process.env.SILO_CTX ?? '')
    .split(',')
    .map(value => value.trim())
    .filter(value => value.length > 0) as SiloCtxEnum[],
});
