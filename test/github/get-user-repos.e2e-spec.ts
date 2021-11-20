import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as nock from 'nock';
import { GitUser } from '../../src/github/infrastructure/type/git-user';
import { UserTypeEnum } from '../../src/github/infrastructure/type/user-type.enum';
import { GitRepository } from '../../src/github/infrastructure/type/git-repository';
import { GitBranch } from '../../src/github/infrastructure/type/git-branch';

import { AppModule } from '../../src/app.module';

describe('Get github user repositories', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    app.close();
  });

  it('check 406 Not Acceptable response', () => {
    const response = {
      status: 406,
      message: 'Not Acceptable',
    };

    return request(app.getHttpServer())
      .get('/api/v1/users/username/repos')
      .set('Accept', 'application/xml')
      .expect(406)
      .expect(response);
  });

  it('check 404 Not Found response', () => {
    nock('https://api.github.com').get('/users/user-not-found').reply(404, {
      message: 'Not Found',
      documentation_url: 'https://docs.github.com/rest/reference/users#get-a-user',
    });

    const response = {
      status: 404,
      message: 'User Not Found',
    };

    return request(app.getHttpServer())
      .get('/api/v1/users/user-not-found/repos')
      .set('Accept', 'application/json')
      .expect(404)
      .expect(response);
  });

  it('check success response for user', () => {
    const userGitHubResponse: GitUser = {
      login: 'john',
      type: UserTypeEnum.User,
    };
    const repositoryGitHubResponse: GitRepository[] = [
      {
        name: 'nest-js-test',
        fork: false,
        owner: {
          login: 'john',
        },
      },
      {
        name: 'nest-core',
        fork: true,
        owner: {
          login: 'john',
        },
      },
    ];
    const branchGitHubResponse: GitBranch[] = [
      {
        name: 'master',
        commit: {
          sha: '8ed4230c8295bba838c2eb7fe6310166d33d3020',
        },
      },
      {
        name: 'develop',
        commit: {
          sha: 'rhbjRb9n8295bba838c2eb7fe6310166d33dy5FU',
        },
      },
    ];
    const response = [
      {
        name: 'nest-js-test',
        ownerLogin: 'john',
        branches: [
          {
            name: 'master',
            sha: '8ed4230c8295bba838c2eb7fe6310166d33d3020',
          },
          {
            name: 'develop',
            sha: 'rhbjRb9n8295bba838c2eb7fe6310166d33dy5FU',
          },
        ],
      },
    ];

    nock('https://api.github.com')
      .get('/users/john')
      .reply(200, userGitHubResponse)
      .get('/users/john/repos')
      .reply(200, repositoryGitHubResponse)
      .get('/repos/john/nest-js-test/branches')
      .reply(200, branchGitHubResponse);

    return request(app.getHttpServer())
      .get('/api/v1/users/john/repos')
      .set('Accept', 'application/json')
      .expect(200)
      .expect(response);
  });

  it('check empty repositories response for user', () => {
    const userGitHubResponse: GitUser = {
      login: 'john',
      type: UserTypeEnum.User,
    };
    const repositoryGitHubResponse: GitRepository[] = [];
    const response = [];

    nock('https://api.github.com')
      .get('/users/john')
      .reply(200, userGitHubResponse)
      .get('/users/john/repos')
      .reply(200, repositoryGitHubResponse);

    return request(app.getHttpServer())
      .get('/api/v1/users/john/repos')
      .set('Accept', 'application/json')
      .expect(200)
      .expect(response);
  });

  it('check success response for organization', () => {
    const organizationGitHubResponse: GitUser = {
      login: 'nestjs',
      type: UserTypeEnum.Organization,
    };
    const repositoryGitHubResponse: GitRepository[] = [
      {
        name: 'nest-cli',
        fork: false,
        owner: {
          login: 'nestjs',
        },
      },
    ];
    const branchGitHubResponse: GitBranch[] = [
      {
        name: 'master',
        commit: {
          sha: '31369b65fc87c0cb30cc2032bb5c2f73fe675997',
        },
      },
    ];
    const response = [
      {
        name: 'nest-cli',
        ownerLogin: 'nestjs',
        branches: [
          {
            name: 'master',
            sha: '31369b65fc87c0cb30cc2032bb5c2f73fe675997',
          },
        ],
      },
    ];

    nock('https://api.github.com')
      .get('/users/nestjs')
      .reply(200, organizationGitHubResponse)
      .get('/orgs/nestjs/repos?type=public')
      .reply(200, repositoryGitHubResponse)
      .get('/repos/nestjs/nest-cli/branches')
      .reply(200, branchGitHubResponse);

    return request(app.getHttpServer())
      .get('/api/v1/users/nestjs/repos')
      .set('Accept', 'application/json')
      .expect(200)
      .expect(response);
  });
});
