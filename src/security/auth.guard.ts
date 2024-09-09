import { Reflector } from '@nestjs/core';
import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';

import { IS_PUBLIC_KEY } from '@/config/api.config';
import { AppLogger } from '@/framework/app.logger';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly logger: AppLogger,
      // private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      
    if (isPublic) { return true; }
      
    const request = context.switchToHttp().getRequest();
    this.logger.debug('CHECK PERMISSIONS...');
    return true;
  }
}