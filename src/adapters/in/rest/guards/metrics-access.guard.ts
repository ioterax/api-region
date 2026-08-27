import { timingSafeEqual } from 'node:crypto';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { MetricsAccessDeniedException } from '@/exceptions/region.exceptions';

interface MetricsRequestModel {
  readonly headers: Readonly<Record<string, string | readonly string[] | undefined>>;
}

/** Requires an explicit service credential for the operational metrics endpoint. */
@Injectable()
export class MetricsAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const configuredToken = process.env.METRICS_BEARER_TOKEN?.trim();
    const authorization = context.switchToHttp().getRequest<MetricsRequestModel>()
      .headers.authorization;
    const suppliedToken =
      typeof authorization === 'string' ? authorization.match(/^Bearer\s+(\S+)$/i)?.[1] : undefined;
    if (!configuredToken || !suppliedToken || !this.matches(suppliedToken, configuredToken)) {
      throw new MetricsAccessDeniedException();
    }
    return true;
  }

  private matches(suppliedToken: string, configuredToken: string): boolean {
    const supplied = Buffer.from(suppliedToken);
    const configured = Buffer.from(configuredToken);
    return supplied.length === configured.length && timingSafeEqual(supplied, configured);
  }
}
