import { Controller, Get, Param, UseFilters } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { UserNotFoundExceptionFilter } from '../../../application/exception_filter/user-not-found.exception.filter';
import { UserReposQuery } from '../../../application/query/user-repos.query';
import { Repository } from '../../../domain/entity/repository';

@Controller('/api')
export class ReposController {
  constructor(private queryBus: QueryBus) {}

  @Get('/v1/users/:username/repos')
  @UseFilters(UserNotFoundExceptionFilter)
  findAll(@Param('username') username: string): Promise<Repository[]> {
    return this.queryBus.execute(new UserReposQuery(username));
  }
}
