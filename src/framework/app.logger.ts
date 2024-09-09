import { Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';

@Injectable()
export class AppLogger {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    console.log(this.logger); 
  }

    info(message: string, context?: string) {
        this.logger.info(this.formatMessage(message, context || this.getContext()));
    }

    error(message: string, trace?: string, context?: string) {
        this.logger.error(this.formatMessage(message, context || this.getContext()), { trace });
    }

    warn(message: string, context?: string) {
        this.logger.warn(this.formatMessage(message, context || this.getContext()));
    }

    debug(message: string, context?: string) {
        this.logger.debug(this.formatMessage(message, context || this.getContext()));
    }

    verbose(message: string, context?: string) {
        this.logger.verbose(this.formatMessage(message, context || this.getContext()));
    }

  private formatMessage(message: string, context: string): string {
    return `[${context}]: ${message}`;
  }

  private getContext(): string {
    const error = new Error();
    const stack = error.stack?.split('\n');

    const relevantLine = stack?.find(line =>
      !line.includes('AppLogger') &&
      !line.includes('Error') &&
      line.includes('at ')
    );

    const classAndMethod = relevantLine?.trim().split(' ')[1] || 'UnknownClass';

    return classAndMethod;
  }
}
