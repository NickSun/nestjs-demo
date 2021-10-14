import { registerAs } from '@nestjs/config';

export default registerAs('appConfig', () => ({
  logLevel: process.env.LOG_LEVEL || 'info',
}));
