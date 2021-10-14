import { Injectable } from '@nestjs/common';
import { GitHubApiClient } from '../service/github.api-client';
import { IUserRepo } from '../../domain/repository/iuser.repo';
import { User } from '../../domain/aggregate_root/user';
import { map, mergeMap } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { Repository } from '../../domain/entity/repository';
import { Branch } from '../../domain/entity/branch';
import { UserTypeEnum } from '../type/user-type.enum';
import { GitUser } from '../type/git-user';
import { GitRepository } from '../type/git-repository';
import { GitBranch } from '../type/git-branch';

@Injectable()
export class UserRepo implements IUserRepo {
  public constructor(private gitHubApiClient: GitHubApiClient) {}

  public getUserRepos(username: string): Observable<Repository[]> {
    return this.gitHubApiClient.getUser(username).pipe(
      map((user: GitUser) => new User(user.login, user.type === UserTypeEnum.Organization)),
      mergeMap((user: User) =>
        this.gitHubApiClient.getNotForkRepos(user).pipe(
          map((repos: GitRepository[]) =>
            repos.map((repo: GitRepository) => new Repository(repo.name, repo.owner.login)),
          ),
          map((repos: Repository[]) => ({ user, repos })),
        ),
      ),
      mergeMap(({ user, repos }) =>
        forkJoin(
          repos.map((repo: Repository) =>
            this.gitHubApiClient.getBranches(user, repo).pipe(
              map((branches: GitBranch[]) =>
                branches.map((branch: GitBranch) => new Branch(branch.name, branch.commit.sha)),
              ),
              map((branches: Branch[]) => repo.setBranches(branches)),
            ),
          ),
        ),
      ),
    );
  }
}
