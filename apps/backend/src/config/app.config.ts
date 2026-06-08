import { registerAs } from '@nestjs/config';
import * as fs from 'fs';

export default registerAs('app', () => {
  const keyPath = process.env['SSL_KEY_PATH'];
  const certPath = process.env['SSL_CERT_PATH'];
  const isHttps =
    keyPath && certPath && fs.existsSync(keyPath) && fs.existsSync(certPath);

  const defaultPort = isHttps ? '443' : '3000';

  return {
    port: parseInt(process.env['PORT'] || defaultPort, 10),
    nodeEnv: process.env['NODE_ENV'] || 'development',
    frontendUrl: process.env['FRONTEND_URL'] || 'http://localhost:3001',
    apiPrefix: 'api/v1',
  };
});
