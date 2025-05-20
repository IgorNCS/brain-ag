import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class KeycloakUserMiddleware implements NestMiddleware {
  constructor(private readonly clsService: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    
    const user = (req as Record<string, any>).user;
    if (user) {
      this.clsService.set('KC_user', user);

    } else if (req.headers.authorization) {
      const token = req.headers.authorization.replace('Bearer ', '');
      try {
        const decoded =jwt.decode(token) as any; 
        this.clsService.set('KC_user', decoded);

      } catch (error) {
        console.error('Erro ao decodificar token:', error);
      }
    }
    
    next();
  }
}