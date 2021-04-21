import { Test, TestingModule } from '@nestjs/testing';
import { ReposController } from './repos.controller';
import { CqrsModule } from '@nestjs/cqrs';

describe('ReposController', () => {
  let reposController: ReposController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [ReposController],
    }).compile();

    reposController = app.get<ReposController>(ReposController);
  });

  describe('root', () => {
    it('findAll method is defined', () => {
      expect(reposController.findAll).toBeDefined();
    });
  });
});
