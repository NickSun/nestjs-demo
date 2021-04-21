import { HttpStatus, Injectable, NestMiddleware, NotAcceptableException } from '@nestjs/common';
import { NextFunction } from 'express';

@Injectable()
export class HeaderMiddleware implements NestMiddleware {
  private readonly acceptAllowed = ['application/json'];

  use(req: Request, res: Response, next: NextFunction) {
    if (!this.acceptAllowed.includes(req.headers['accept'])) {
      throw new NotAcceptableException({
        status: HttpStatus.NOT_ACCEPTABLE,
        message: 'Not Acceptable',
      });
    }

    next();
  }
}
