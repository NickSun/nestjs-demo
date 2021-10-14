import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';
import { ReposController } from '../presentation/json/controller/repos.controller';
import { GitHubApiClient } from './service/github.api-client';
import { UserRepo } from './repository/user.repo';
import { UserReposHandler } from '../application/query/handler/user-repos.handler';
import { HeaderMiddleware } from '../application/middleware/header.middleware';
import { IUserRepo } from '../domain/repository/iuser.repo';
import { Performance } from '../application/helper/performance';
import { InjectionToken } from '../application/helper/injection-token.enum';
import { WinstonLogger } from './service/winston-logger';
import { AppConfigService } from '../../config/app-config.service';

@Module({
  imports: [CqrsModule, HttpModule],
  controllers: [ReposController],
  providers: [
    AppConfigService,
    GitHubApiClient,
    UserReposHandler,
    {
      provide: IUserRepo,
      useClass: UserRepo,
    },
    {
      provide: InjectionToken.LOGGER,
      useExisting: WinstonLogger,
    },
    WinstonLogger,
    Performance,
  ],
})
export class GitHubModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HeaderMiddleware).forRoutes(ReposController);
  }
}
