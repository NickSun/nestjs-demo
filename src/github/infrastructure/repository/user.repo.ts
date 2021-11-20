import { HttpStatus, Injectable } from '@nestjs/common';
import { GitHubApiClient } from '../service/github.api-client';
import { IUserRepo } from '../../domain/repository/iuser.repo';
import { User } from '../../domain/aggregate_root/user';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { Repository } from '../../domain/entity/repository';
import { Branch } from '../../domain/entity/branch';
import { UserTypeEnum } from '../type/user-type.enum';
import { GitUser } from '../type/git-user';
import { GitRepository } from '../type/git-repository';
import { GitBranch } from '../type/git-branch';
import { UserNotFoundException } from '../../domain/exception/user-not-found.exception';

@Injectable()
export class UserRepo implements IUserRepo {
  public constructor(private gitHubApiClient: GitHubApiClient) {}

  public getUserRepos(username: string): Observable<Repository[]> {
    return this.getUser(username).pipe(
      mergeMap((user: User) => this.getNotForkRepos(user)),
      mergeMap(({ user, repos }: { user: User; repos: Repository[] }) =>
        this.getBranches(user, repos),
      ),
    );
  }

  private getUser(username: string): Observable<User> {
    return this.gitHubApiClient
      .get<GitUser>(this.gitHubApiClient.endpoints.getUser(username), 'Get user info')
      .pipe(
        catchError((err) => {
          if (err?.response?.status === HttpStatus.NOT_FOUND) {
            throw new UserNotFoundException();
          }

          throw err;
        }),
        map((user: GitUser) => new User(user.login, user.type === UserTypeEnum.Organization)),
      );
  }

  private getNotForkRepos(user: User): Observable<{ user: User; repos: Repository[] }> {
    const path = user.isOrganization()
      ? this.gitHubApiClient.endpoints.getOrganizationReposList(user.getLogin())
      : this.gitHubApiClient.endpoints.getUserReposList(user.getLogin());

    return this.gitHubApiClient.get<GitRepository[]>(path, 'Get user repositories').pipe(
      map((repos: GitRepository[]) => repos.filter((repo: GitRepository) => !repo.fork)),
      map((repos: GitRepository[]) =>
        repos.map((repo: GitRepository) => new Repository(repo.name, repo.owner.login)),
      ),
      map((repos: Repository[]) => ({ user, repos })),
    );
  }

  private getBranches(user: User, repos: Repository[]): Observable<Repository[]> {
    return forkJoin(
      repos.map((repo: Repository) => {
        const path = this.gitHubApiClient.endpoints.getBranches(user.getLogin(), repo.getName());

        return this.gitHubApiClient.get<GitBranch[]>(path, 'Get repository branches').pipe(
          map((branches: GitBranch[]) =>
            branches.map((branch: GitBranch) => new Branch(branch.name, branch.commit.sha)),
          ),
          map((branches: Branch[]) => repo.setBranches(branches)),
        );
      }),
    );
  }
}
