import { join } from 'node:path';

process.env.JWT_PUBLIC_KEY_PATH ??= join(__dirname, 'fixtures', 'test-public-key.pem');
