import { Injectable, LoggerService } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';

const winston = require('winston');

@Injectable()
export class WinstonLogger implements LoggerService {
  private logger;

  constructor(private appConfigService: AppConfigService) {
    this.logger = winston.createLogger({
      level: appConfigService.logLevel,
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      humanReadableUnhandledException: true,
      showLevel: true,
      handleExceptions: true,
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
      ],
    });

    if (process.env.NODE_ENV === 'test') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.cli(),
            winston.format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss.SSS',
            }),
            winston.format.printf(
              (info) => `${info.timestamp} ${info.level}: ${info.message}${info.splat || ''}`,
            ),
          ),
        }),
      );
    }
  }

  log(message: any, ...optionalParams: any[]): any {
    this.logger.info(message, { payload: optionalParams });
  }

  error(message: any, ...optionalParams: any[]): any {
    this.logger.error(message, { payload: optionalParams });
  }

  warn(message: any, ...optionalParams: any[]): any {
    this.logger.warn(message, { payload: optionalParams });
  }

  debug(message: any, ...optionalParams: any[]): any {
    this.logger.debug(message, { payload: optionalParams });
  }
}
