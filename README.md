<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## Description

Github User Repositories demo application.

## Installation

```bash
$ git clone https://github.com/NickSun/nestjs-demo.git
$ cd nestjs-demo
$ cp .env.dist .env
```

## Running the app

```bash
$ docker-compose up
```

Check that [http://localhost:3000/api/](http://localhost:3000/api/) works.

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov

# e2e test coverage
$ npm run test:e2e:cov
```

## Deploy

You have to set proper value for the `AWS_REGION` and for the `AWS_ECR_REPOSITORY_DOMAIN_URI` variable in the `.env` file before deploy.
After that run:
```bash
$ ./cloudformation-create-stack.sh
```

To remove all AWS infrastructure run:
```bash
$ ./cloudformation-delete-stack.sh
```

### Technologies and frameworks

- [NestJs](http://nestjs.com/)
- [Jest](https://jestjs.io/)
- [Swagger](https://swagger.io/)
- [AWS CloudFormation](https://aws.amazon.com/cloudformation/)