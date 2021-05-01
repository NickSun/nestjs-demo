import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpService, INestApplication, ValidationPipe } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosError } from 'axios';
import { GithubModule } from '../../src/github/infrastructure/github.module';

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
    return request(app.getHttpServer())
      .get('/api/v1/users/username/repos')
      .set('Accept', 'application/xml')
      .expect(406)
      .expect({
        status: 406,
        message: 'Not Acceptable',
      });
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
    httpService.get = jest.fn().mockImplementationOnce(() => throwError(err));

    return request(app.getHttpServer())
      .get('/api/v1/users/usernotfound/repos')
      .set('Accept', 'application/json')
      .expect(404)
      .expect({
        status: 404,
        message: 'User Not Found',
      });
  });

  it('check success response for user', () => {
    httpService.get = jest
      .fn()
      .mockImplementationOnce(() =>
        of({
          data: {
            login: 'john',
            type: 'User',
          },
        }),
      )
      .mockImplementationOnce(() =>
        of({
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
        }),
      )
      .mockImplementationOnce(() =>
        of({
          data: [
            {
              name: 'master',
              commit: {
                sha: '8ed4230c8295bba838c2eb7fe6310166d33d3020',
              },
            },
          ],
        }),
      );

    return request(app.getHttpServer())
      .get('/api/v1/users/john/repos')
      .set('Accept', 'application/json')
      .expect(200)
      .expect([
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
      ]);
  });

  it('check success response for organization', () => {
    httpService.get = jest
      .fn()
      .mockImplementationOnce(() =>
        of({
          data: {
            login: 'nestjs',
            type: 'Organization',
          },
        }),
      )
      .mockImplementationOnce(() =>
        of({
          data: [
            {
              name: 'nest-cli',
              fork: false,
              owner: {
                login: 'nestjs',
              },
            },
          ],
        }),
      )
      .mockImplementationOnce(() =>
        of({
          data: [
            {
              name: 'master',
              commit: {
                sha: '31369b65fc87c0cb30cc2032bb5c2f73fe675997',
              },
            },
          ],
        }),
      );

    return request(app.getHttpServer())
      .get('/api/v1/users/nestjs/repos')
      .set('Accept', 'application/json')
      .expect(200)
      .expect([
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
      ]);
  });

  afterAll(() => {
    app.close();
  });
});
