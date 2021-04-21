import { HttpService, HttpStatus, Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { GitRepository } from '../type/git-repository';
import { GitUser } from '../type/git-user';
import { UserTypeEnum } from '../type/user-type.enum';
import { GitBranch } from '../type/git-branch';
import { User } from '../../domain/aggregate_root/user';
import { UserNotFoundException } from '../../domain/exception/user-not-found.exception';
import { Repository } from '../../domain/entity/repository';
import { Branch } from '../../domain/entity/branch';

@Injectable()
export class GithubApiClient {
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

  public constructor(private httpService: HttpService) {}

  public async getUser(username: string): Promise<User> {
    return await this.httpService
      .get<GitUser>(this.endpoints.getUser(username), {
        headers: this.headers,
      })
      .pipe(
        map((res) => res.data),
        map((user) => new User(user.login, user.type === UserTypeEnum.Organization)),
      )
      .toPromise()
      .catch((err) => {
        if (err.response && err.response.status === HttpStatus.NOT_FOUND) {
          throw new UserNotFoundException();
        }

        throw err;
      });
  }

  public async getNotForkRepos(user: User): Promise<Repository[]> {
    const endpoint = user.isOrganization()
      ? this.endpoints.getOrganizationReposList(user.getLogin())
      : this.endpoints.getUserReposList(user.getLogin());

    return await this.httpService
      .get<GitRepository[]>(endpoint, {
        headers: this.headers,
      })
      .pipe(
        map((res) => res.data),
        map((repos) => repos.filter((repo) => !repo.fork)),
        map((repos) => repos.map((repo) => new Repository(repo.name, repo.owner.login))),
      )
      .toPromise();
  }

  public async getBranches(user: User, repo: Repository): Promise<Branch[]> {
    return await this.httpService
      .get<GitBranch[]>(this.endpoints.getBranches(user.getLogin(), repo.getName()), {
        headers: this.headers,
      })
      .pipe(
        map((res) => res.data),
        map((branches) => branches.map((branch) => new Branch(branch.name, branch.commit.sha))),
      )
      .toPromise();
  }
}
