import { Observable, of, zip } from 'rxjs';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { performance } from 'perf_hooks';
import { InjectionToken } from './injection-token.enum';

@Injectable()
export class Performance {
  constructor(
    @Inject(InjectionToken.LOGGER)
    private readonly logger: LoggerService,
  ) {}

  measureTimeObservable(observable: Observable<any>, description: string): Observable<any> {
    return zip(of(performance.now()), observable, (startTime, observableResult) => {
      this.logDuration(description, startTime, performance.now());

      return observableResult;
    });
  }

  private logDuration(description, startTime, endTime) {
    this.logger.debug(`${description}: duration=${this.formatDuration(startTime, endTime)}ms`);
  }

  private formatDuration(startTime, endTime) {
    return (endTime - startTime).toFixed(2);
  }
}
