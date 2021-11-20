import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  getLogLevel(): string {
    return this.configService.get('appConfig.logLevel');
  }
}
