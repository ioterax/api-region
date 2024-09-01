import { Reflector } from '@nestjs/core';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '@/config/api.config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
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
    console.log('CHECK PERMISSIONS...');
    return true;
  }
}