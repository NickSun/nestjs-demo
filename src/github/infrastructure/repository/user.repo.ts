import { Injectable } from '@nestjs/common';
import { GithubApiClient } from '../service/github.api-client';
import { IUserRepo } from '../../domain/repository/iuser.repo';
import { User } from '../../domain/aggregate_root/user';

@Injectable()
export class UserRepo implements IUserRepo {
  public constructor(private githubApiClient: GithubApiClient) {}

  async getUser(username: string): Promise<User> {
    const user = await this.githubApiClient.getUser(username);

    const repos = await this.githubApiClient.getNotForkRepos(user);

    const promises = [];
    repos.forEach((repo) => {
      promises.push(
        (async (repo) => {
          const branches = await this.githubApiClient.getBranches(user, repo);
          repo.setBranches(branches);
        })(repo),
      );
    });

    await Promise.all(promises);

    user.setRepos(repos);

    return user;
  }
}
