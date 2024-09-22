/* eslint-disable no-useless-constructor */
/* eslint-disable no-unused-vars */
/* eslint-disable no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as util from 'util';
import { Reflector } from '@nestjs/core';
import {
  Injectable, CanActivate, ExecutionContext, SetMetadata, Inject, InternalServerErrorException, OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';

import { AppLogger } from '@atisiothings/laniakea-lib-audit';
import { AuthClientService } from '@atisiothings/laniakea-lib-http/dist/framework/grpc/auth.client';
import { ValidateTokenRequest } from '@atisiothings/laniakea-lib-http/dist/ports/in/auth.in.port'; 

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class AuthGuard implements CanActivate, OnModuleInit {
  constructor(
    @Inject(AppLogger) private readonly logger: AppLogger,
    private reflector: Reflector,
    private readonly authClientService: AuthClientService,
  ) { }

  onModuleInit() {
    // this.authService = this.clientGrpc.getService<AuthService>('AuthService');
  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!process.env.NODE_ENV) {
      this.logger.error('NODE_ENV is not defined!');
      throw new InternalServerErrorException('InvalidEnvironmentException: NODE_ENV is not defined.');
    }

    if (isPublic || process.env.NODE_ENV === 'local') {
      this.logger.debug('Public endpoint or local environment, bypassing AuthGuard.');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    this.logger.debug('CHECK PERMISSIONS...');
    this.logger.debug(`Headers: ${JSON.stringify(request.headers)}`);
    this.logger.debug(`Body: ${JSON.stringify(request.body)}`);
    this.logger.verbose(`request=${util.inspect(request, { depth: 3, colors: true })}`);

    const token = request.headers.authorization?.split(' ')[1];;

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const response = await this.authClientService.validateToken(token);
    this.logger.debug(`tokenResponse: ${response.message} - ${response.valid}`);

    if (!response.valid) {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

}
