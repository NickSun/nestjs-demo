import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GitHubModule } from './github/infrastructure/github.module';
import { validate } from './config/env.validation';
import appConfig from './config/app-config';

@Module({
  imports: [
    GitHubModule,
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      validate,
      cache: true,
      load: [appConfig],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
