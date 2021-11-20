import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { Performance } from '../../application/helper/performance';
import { InjectionToken } from '../../application/helper/injection-token.enum';

@Injectable()
export class GitHubApiClient {
  public readonly endpoints = {
    getUser: (username: string) => `${this.baseUrl}/users/${username}`,
    getOrganizationReposList: (org: string) => `${this.baseUrl}/orgs/${org}/repos?type=public`,
    getUserReposList: (username: string) => `${this.baseUrl}/users/${username}/repos`,
    getBranches: (owner: string, repo: string) => `${this.baseUrl}/repos/${owner}/${repo}/branches`,
  };

  private readonly baseUrl = 'https://api.github.com';
  private readonly headers = {
    Accept: 'application/vnd.github.v3+json',
  };

  public constructor(
    @Inject(InjectionToken.LOGGER)
    private readonly logger: LoggerService,
    private readonly httpService: HttpService,
    private readonly performance: Performance,
  ) {}

  public get<T>(path: string, description: string): Observable<T> {
    return this.performance.measureTimeObservable(
      this.httpService
        .get<T>(path, {
          headers: this.headers,
        })
        .pipe(
          tap((res: AxiosResponse<T>) => {
            this.logger.log(`${this.constructor.name}: ${description} - status: ${res.status}`);
            this.logger.log(
              `${this.constructor.name}: ${description} - headers: ${JSON.stringify(res.headers)}`,
            );
            this.logger.log(
              `${this.constructor.name}: ${description} - response: ${JSON.stringify(res.data)}`,
            );
          }),
          map((res: AxiosResponse<T>) => res.data),
        ),
      description,
    );
  }
}
