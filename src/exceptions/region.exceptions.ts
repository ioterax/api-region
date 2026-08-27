import { CustomException, ErrorCategory } from '@ioterax/foundation-lib-commons';

const REGION_MODULE = 'REGION';
const REGION_KEY = 'region.query';

export class RegionException extends CustomException {}

function definition(
  errorCode: string,
  key: string,
  category: ErrorCategory,
): { errorCode: string; module: string; errorKey: string; category: ErrorCategory } {
  return { errorCode, module: REGION_MODULE, errorKey: `${REGION_KEY}.${key}`, category };
}

export class RegionNotFoundException extends RegionException {
  constructor() {
    super(definition('REGION_RECORD_NOT_FOUND', 'not_found', ErrorCategory.NOT_FOUND));
  }
}

export class RegionCatalogUnavailableException extends RegionException {
  constructor() {
    super(
      definition('REGION_CATALOG_UNAVAILABLE', 'catalog_unavailable', ErrorCategory.UNAVAILABLE),
    );
  }
}

export class RegionDataInvalidException extends RegionException {
  constructor() {
    super(definition('REGION_DATA_INVALID', 'data_invalid', ErrorCategory.INFRASTRUCTURE));
  }
}

export class RegionPersistenceUnavailableException extends RegionException {
  constructor() {
    super(
      definition(
        'REGION_PERSISTENCE_UNAVAILABLE',
        'persistence_unavailable',
        ErrorCategory.UNAVAILABLE,
      ),
    );
  }
}

export class MetricsAccessDeniedException extends RegionException {
  constructor() {
    super(
      definition(
        'REGION_METRICS_ACCESS_DENIED',
        'metrics_access_denied',
        ErrorCategory.AUTHENTICATION,
      ),
    );
  }
}
