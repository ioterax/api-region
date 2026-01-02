import { bootstrapMicroservice, SiloCtxEnum } from '@ioterax/bootstrap-lib-starter';
import { CustomExceptionFilter, DomainExceptionFilter } from '@ioterax/foundation-lib-commons';
import { AppModule } from './app.module';
import { setupB2BSwagger } from './api/swagger/api-b2b.config';
const banner = `
          ▄▖    ▖▖      ▄▖    ▘      ▄▖      ▘    
▛▌▀▌▛▘▛▘  ▙▖▛▘▀▌▚▘  ▄▖  ▙▘█▌▛▌▌▛▌▛▌  ▚ █▌▛▘▌▌▌▛▘█▌
▙▌█▌▄▌▄▌▗ ▙▖▌ █▌▌▌      ▌▌▙▖▙▌▌▙▌▌▌  ▄▌▙▖▌ ▚▘▌▙▖▙▖
▌                           ▄▌`;

bootstrapMicroservice({
  appModule: AppModule,
  serviceName: 'Region API',
  banner,
  enableGrpc: false,
  port: Number(process.env.LISTEN_PORT),
  filters: [CustomExceptionFilter, DomainExceptionFilter],
  swagger: [setupB2BSwagger],
  siloContext: (process.env.SILO_CTX ?? '')
    .split(',')
    .map(v => v.trim())
    .filter(v => v.length > 0) as SiloCtxEnum[],
});
