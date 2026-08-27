import { bootstrapMicroservice } from '@ioterax/bootstrap-lib-starter';

jest.mock('@ioterax/bootstrap-lib-starter', () => ({
  bootstrapMicroservice: jest.fn().mockResolvedValue(undefined),
  SiloCtxEnum: {},
}));

describe('main', () => {
  const originalEnv = { ...process.env };

  afterAll(() => {
    process.env = originalEnv;
  });

  it('boots the private Region API with the exact configured port and silo contexts', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017';
    process.env.PORT = '4903';
    process.env.SILO_CTX = 'b2b, technical';
    await import('@/main');
    expect(bootstrapMicroservice).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceName: 'Region API',
        port: 4903,
        enableGrpc: false,
        siloContext: ['b2b', 'technical'],
      }),
    );
  });
});
