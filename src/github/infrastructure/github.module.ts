import { HttpModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ReposController } from '../presentation/json/controller/repos.controller';
import { GithubApiClient } from './service/github.api-client';
import { UserRepo } from './repository/user.repo';
import { UserReposHandler } from '../application/query/handler/user-repos.handler';
import { HeaderMiddleware } from '../application/middleware/header.middleware';
import { IUserRepo } from '../domain/repository/iuser.repo';

@Module({
  imports: [CqrsModule, HttpModule],
  controllers: [ReposController],
  providers: [
    GithubApiClient,
    UserReposHandler,
    {
      provide: IUserRepo,
      useClass: UserRepo,
    },
  ],
})
export class GithubModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HeaderMiddleware).forRoutes(ReposController);
  }
}
