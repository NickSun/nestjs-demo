import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {
  }

  get logLevel(): string {
    return this.configService.get('appConfig.logLevel');
  }
}
