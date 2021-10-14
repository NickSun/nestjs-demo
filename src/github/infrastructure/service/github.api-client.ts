import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GitRepository } from '../type/git-repository';
import { GitUser } from '../type/git-user';
import { GitBranch } from '../type/git-branch';
import { User } from '../../domain/aggregate_root/user';
import { UserNotFoundException } from '../../domain/exception/user-not-found.exception';
import { Repository } from '../../domain/entity/repository';
import { Performance } from '../../application/helper/performance';

@Injectable()
export class GitHubApiClient {
  private readonly baseUrl = 'https://api.github.com';

  private readonly headers = {
    Accept: 'application/vnd.github.v3+json',
  };

  private readonly endpoints = {
    getUser: (username: string) => `${this.baseUrl}/users/${username}`,
    getOrganizationReposList: (org: string) => `${this.baseUrl}/orgs/${org}/repos?type=public`,
    getUserReposList: (username: string) => `${this.baseUrl}/users/${username}/repos`,
    getBranches: (owner: string, repo: string) => `${this.baseUrl}/repos/${owner}/${repo}/branches`,
  };

  public constructor(private httpService: HttpService, private performance: Performance) {}

  public getUser(username: string): Observable<GitUser> {
    return this.performance.measureTimeObservable(
      this.httpService
        .get<GitUser>(this.endpoints.getUser(username), {
          headers: this.headers,
        })
        .pipe(
          map((res: AxiosResponse<GitUser>) => res.data),
          catchError((err) => {
            if (err.response && err.response.status === HttpStatus.NOT_FOUND) {
              throw new UserNotFoundException();
            }

            throw err;
          }),
        ),
      'Get GitHub user info',
    );
  }

  public getNotForkRepos(user: User): Observable<GitRepository[]> {
    const endpoint = user.isOrganization()
      ? this.endpoints.getOrganizationReposList(user.getLogin())
      : this.endpoints.getUserReposList(user.getLogin());

    return this.performance.measureTimeObservable(
      this.httpService
        .get<GitRepository[]>(endpoint, {
          headers: this.headers,
        })
        .pipe(
          map((res: AxiosResponse<GitRepository[]>) => res.data),
          map((repos: GitRepository[]) => repos.filter((repo: GitRepository) => !repo.fork)),
        ),
      'Get GitHub user repositories',
    );
  }

  public getBranches(user: User, repo: Repository): Observable<GitBranch[]> {
    return this.performance.measureTimeObservable(
      this.httpService
        .get<GitBranch[]>(this.endpoints.getBranches(user.getLogin(), repo.getName()), {
          headers: this.headers,
        })
        .pipe(
          map((res: AxiosResponse<GitBranch[]>) => res.data),
        ),
      'Get GitHub repository branches',
    );
  }
}
