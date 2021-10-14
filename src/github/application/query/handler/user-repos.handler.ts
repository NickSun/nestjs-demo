import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserReposQuery } from '../user-repos.query';
import { Repository } from '../../../domain/entity/repository';
import { IUserRepo } from '../../../domain/repository/iuser.repo';
import { lastValueFrom } from 'rxjs';

@QueryHandler(UserReposQuery)
export class UserReposHandler implements IQueryHandler<UserReposQuery, Repository[]> {
  public constructor(private userRepo: IUserRepo) {}

  public execute(query: UserReposQuery): Promise<Repository[]> {
    return lastValueFrom(this.userRepo.getUserRepos(query.username), { defaultValue: [] });
  }
}
