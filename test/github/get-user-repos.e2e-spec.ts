import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpService, INestApplication, ValidationPipe } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { GithubModule } from '../../src/github/infrastructure/github.module';
import { GitUser } from '../../src/github/infrastructure/type/git-user';
import { UserTypeEnum } from '../../src/github/infrastructure/type/user-type.enum';
import { GitRepository } from '../../src/github/infrastructure/type/git-repository';
import { GitBranch } from '../../src/github/infrastructure/type/git-branch';

describe('Get github user repositories', () => {
  let app: INestApplication;
  let httpService: HttpService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GithubModule],
    }).compile();

    httpService = moduleRef.get<HttpService>(HttpService);

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
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
    const err: Partial<AxiosError> = {
      response: {
        status: 404,
        statusText: 'Not Found',
        data: {
          message: 'Not Found',
          documentation_url: 'https://docs.github.com/rest/reference/users#get-a-user',
        },
        headers: {},
        config: {},
      },
    };
    const response = {
      status: 404,
      message: 'User Not Found',
    };

    jest.spyOn(httpService, 'get').mockImplementationOnce(() => throwError(err));

    return request(app.getHttpServer())
      .get('/api/v1/users/usernotfound/repos')
      .set('Accept', 'application/json')
      .expect(404)
      .expect(response);
  });

  it('check success response for user', () => {
    const defaultResponseFields = {
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };
    const userGitHubResponse: AxiosResponse<GitUser> = {
      data: {
        login: 'john',
        type: UserTypeEnum.User,
      },
      ...defaultResponseFields,
    };
    const repositoryGitHubResponse: AxiosResponse<GitRepository[]> = {
      data: [
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
      ],
      ...defaultResponseFields,
    };
    const branchGitHubResponse: AxiosResponse<GitBranch[]> = {
      data: [
        {
          name: 'master',
          commit: {
            sha: '8ed4230c8295bba838c2eb7fe6310166d33d3020',
          },
        },
      ],
      ...defaultResponseFields,
    };
    const response = [
      {
        name: 'nest-js-test',
        ownerLogin: 'john',
        branches: [
          {
            name: 'master',
            sha: '8ed4230c8295bba838c2eb7fe6310166d33d3020',
          },
        ],
      },
    ];

    jest
      .spyOn(httpService, 'get')
      .mockImplementationOnce(() => of(userGitHubResponse))
      .mockImplementationOnce(() => of(repositoryGitHubResponse))
      .mockImplementationOnce(() => of(branchGitHubResponse));

    return request(app.getHttpServer())
      .get('/api/v1/users/john/repos')
      .set('Accept', 'application/json')
      .expect(200)
      .expect(response);
  });

  it('check empty response for user', () => {
    const defaultResponseFields = {
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };
    const userGitHubResponse: AxiosResponse<GitUser> = {
      data: {
        login: 'john',
        type: UserTypeEnum.User,
      },
      ...defaultResponseFields,
    };
    const repositoryGitHubResponse: AxiosResponse<GitRepository[]> = {
      data: [],
      ...defaultResponseFields,
    };
    const response = [];

    jest
      .spyOn(httpService, 'get')
      .mockImplementationOnce(() => of(userGitHubResponse))
      .mockImplementationOnce(() => of(repositoryGitHubResponse));

    return request(app.getHttpServer())
      .get('/api/v1/users/john/repos')
      .set('Accept', 'application/json')
      .expect(200)
      .expect(response);
  });

  it('check success response for organization', () => {
    const defaultResponseFields = {
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };
    const organizationGitHubResponse: AxiosResponse<GitUser> = {
      data: {
        login: 'nestjs',
        type: UserTypeEnum.Organization,
      },
      ...defaultResponseFields,
    };
    const repositoryGitHubResponse: AxiosResponse<GitRepository[]> = {
      data: [
        {
          name: 'nest-cli',
          fork: false,
          owner: {
            login: 'nestjs',
          },
        },
      ],
      ...defaultResponseFields,
    };
    const branchGitHubResponse: AxiosResponse<GitBranch[]> = {
      data: [
        {
          name: 'master',
          commit: {
            sha: '31369b65fc87c0cb30cc2032bb5c2f73fe675997',
          },
        },
      ],
      ...defaultResponseFields,
    };
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

    jest
      .spyOn(httpService, 'get')
      .mockImplementationOnce(() => of(organizationGitHubResponse))
      .mockImplementationOnce(() => of(repositoryGitHubResponse))
      .mockImplementationOnce(() => of(branchGitHubResponse));

    return request(app.getHttpServer())
      .get('/api/v1/users/nestjs/repos')
      .set('Accept', 'application/json')
      .expect(200)
      .expect(response);
  });

  afterAll(() => {
    app.close();
  });
});
