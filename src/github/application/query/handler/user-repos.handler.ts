import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserReposQuery } from '../user-repos.query';
import { Repository } from '../../../domain/entity/repository';
import { IUserRepo } from '../../../domain/repository/iuser.repo';

@QueryHandler(UserReposQuery)
export class UserReposHandler implements IQueryHandler<UserReposQuery, Repository[]> {
  public constructor(private userRepo: IUserRepo) {}

  public async execute(query: UserReposQuery): Promise<Repository[]> {
    return await this.userRepo.getUser(query.username).then((user) => user.getRepos());
  }
}
