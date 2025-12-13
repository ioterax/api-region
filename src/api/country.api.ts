import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

/**
 * CountryApiEndpoint is a utility class that provides static methods
 * to apply OpenAPI annotations to the CountryController methods.
 *
 * These methods encapsulate the OpenAPI decorators, making it easier to
 * maintain and apply the annotations in a clean and modular way.
 */
export class CountryApiEndpoint {
  /**
   * Applies OpenAPI decorators for creating a new Country entity.
   *
   * This method includes operation summary, response schemas for
   * success and error cases, and a request body schema.
   *
   * @returns A set of decorators to be applied to the controller method.
   */
  static create() {
    return applyDecorators(
      ApiOperation({ summary: 'Create a new Country entity' }),
      ApiResponse({
        status: 201,
        description: 'The Country has been successfully created.',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Country',
            },
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: 'Invalid input data.',
        content: {
          'application/json': {
            example: {
              statusCode: 400,
              message: 'Invalid country data',
              error: 'Bad Request',
            },
          },
        },
      }),
      ApiBody({
        schema: {
          $ref: '#/components/schemas/Country',
        },
        description: 'The Country entity to create',
      }),
    );
  }

  /**
   * Applies OpenAPI decorators for retrieving a list of all Country entities.
   *
   * This method includes operation summary and response schema for
   * the successful retrieval of the list of countries.
   *
   * @returns A set of decorators to be applied to the controller method.
   */
  static list() {
    return applyDecorators(
      ApiOperation({ summary: 'Retrieve a list of all Country entities' }),
      ApiResponse({
        status: 200,
        description: 'List of Country entities',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: { $ref: '#/components/schemas/Country' },
            },
          },
        },
      }),
    );
  }

  /**
   * Applies OpenAPI decorators for retrieving a single Country entity by ID.
   *
   * This method includes operation summary, path parameter, and response schemas
   * for successful and error cases.
   *
   * @returns A set of decorators to be applied to the controller method.
   */
  static get() {
    return applyDecorators(
      ApiOperation({ summary: 'Retrieve a single Country entity by ID' }),
      ApiParam({
        name: 'id',
        description: 'ID of the Country entity',
        required: true,
        schema: { type: 'string' },
      }),
      ApiResponse({
        status: 200,
        description: 'The found Country entity',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Country',
            },
          },
        },
      }),
      ApiResponse({
        status: 404,
        description: 'Country not found',
        content: {
          'application/json': {
            example: {
              statusCode: 404,
              message: 'Country not found',
              error: 'Not Found',
            },
          },
        },
      }),
    );
  }

  /**
   * Applies OpenAPI decorators for updating an existing Country entity by ID.
   *
   * This method includes operation summary, path parameter, response schemas for
   * success and error cases, and a request body schema.
   *
   * @returns A set of decorators to be applied to the controller method.
   */
  static update() {
    return applyDecorators(
      ApiOperation({ summary: 'Update an existing Country entity by ID' }),
      ApiParam({
        name: 'id',
        description: 'ID of the Country entity',
        required: true,
        schema: { type: 'string' },
      }),
      ApiResponse({
        status: 200,
        description: 'The Country entity has been updated.',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Country',
            },
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: 'Invalid input data.',
        content: {
          'application/json': {
            example: {
              statusCode: 400,
              message: 'Invalid country data',
              error: 'Bad Request',
            },
          },
        },
      }),
      ApiResponse({
        status: 404,
        description: 'Country not found',
        content: {
          'application/json': {
            example: {
              statusCode: 404,
              message: 'Country not found',
              error: 'Not Found',
            },
          },
        },
      }),
      ApiBody({
        schema: {
          $ref: '#/components/schemas/Country',
        },
        description: 'The new data for the Country entity',
      }),
    );
  }

  /**
   * Applies OpenAPI decorators for deleting a Country entity by ID.
   *
   * This method includes operation summary, path parameter, and response schemas
   * for success and error cases.
   *
   * @returns A set of decorators to be applied to the controller method.
   */
  static delete() {
    return applyDecorators(
      ApiOperation({ summary: 'Delete a Country entity by ID' }),
      ApiParam({
        name: 'id',
        description: 'ID of the Country entity',
        required: true,
        schema: { type: 'string' },
      }),
      ApiResponse({
        status: 204,
        description: 'The Country entity has been deleted.',
      }),
      ApiResponse({
        status: 404,
        description: 'Country not found',
        content: {
          'application/json': {
            example: {
              statusCode: 404,
              message: 'Country not found',
              error: 'Not Found',
            },
          },
        },
      }),
    );
  }
}
