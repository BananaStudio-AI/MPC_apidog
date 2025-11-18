/**
 * Standardized Error Response Interface for MPC-API
 * 
 * All API errors should follow this structure for consistency
 */

export class ApiError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      error: {
        code: this.errorCode,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        ...(this.details && { details: this.details })
      }
    };
  }
}

/**
 * Pre-defined error types for common scenarios
 */
export const ErrorTypes = {
  // 400-level errors (Client errors)
  BAD_REQUEST: (message, details) => 
    new ApiError(message, 400, 'BAD_REQUEST', details),
  
  UNAUTHORIZED: (message = 'Authentication required', details) =>
    new ApiError(message, 401, 'UNAUTHORIZED', details),
  
  FORBIDDEN: (message = 'Access denied', details) =>
    new ApiError(message, 403, 'FORBIDDEN', details),
  
  NOT_FOUND: (message = 'Resource not found', details) =>
    new ApiError(message, 404, 'NOT_FOUND', details),
  
  VALIDATION_ERROR: (message, details) =>
    new ApiError(message, 422, 'VALIDATION_ERROR', details),
  
  RATE_LIMIT_EXCEEDED: (message = 'Rate limit exceeded', details) =>
    new ApiError(message, 429, 'RATE_LIMIT_EXCEEDED', details),
  
  // 500-level errors (Server errors)
  INTERNAL_ERROR: (message = 'Internal server error', details) =>
    new ApiError(message, 500, 'INTERNAL_ERROR', details),
  
  SERVICE_UNAVAILABLE: (message = 'Service temporarily unavailable', details) =>
    new ApiError(message, 503, 'SERVICE_UNAVAILABLE', details),
  
  GATEWAY_TIMEOUT: (message = 'Gateway timeout', details) =>
    new ApiError(message, 504, 'GATEWAY_TIMEOUT', details),
  
  // Domain-specific errors
  LLM_ERROR: (message = 'LLM provider error', details) =>
    new ApiError(message, 502, 'LLM_ERROR', details),
  
  GENERATION_FAILED: (message = 'Content generation failed', details) =>
    new ApiError(message, 500, 'GENERATION_FAILED', details),
};

/**
 * Express error handler middleware
 * 
 * Usage:
 *   app.use(errorHandler);
 */
export function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    code: err.errorCode || 'UNKNOWN',
    statusCode: err.statusCode || 500,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });

  // Handle ApiError instances
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle validation errors from express-validator or similar
  if (err.name === 'ValidationError') {
    const apiError = ErrorTypes.VALIDATION_ERROR(err.message, err.errors);
    return res.status(apiError.statusCode).json(apiError.toJSON());
  }

  // Handle generic errors
  const genericError = ErrorTypes.INTERNAL_ERROR(
    process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred'
      : err.message
  );
  
  return res.status(genericError.statusCode).json(genericError.toJSON());
}

/**
 * Async route handler wrapper to catch errors
 * 
 * Usage:
 *   app.get('/endpoint', asyncHandler(async (req, res) => {
 *     // Your async code here
 *   }));
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Success response helper
 * 
 * Usage:
 *   res.json(successResponse(data, 'Success message'));
 */
export function successResponse(data, message = 'Success', meta = null) {
  return {
    success: true,
    message,
    data,
    ...(meta && { meta }),
    timestamp: new Date().toISOString()
  };
}

/**
 * Example usage in route handlers:
 * 
 * import { ErrorTypes, asyncHandler, successResponse } from './errors.js';
 * 
 * app.post('/generate/script', asyncHandler(async (req, res) => {
 *   const { prompt } = req.body;
 *   
 *   if (!prompt) {
 *     throw ErrorTypes.BAD_REQUEST('Prompt is required', { field: 'prompt' });
 *   }
 *   
 *   const result = await generateScript(prompt);
 *   res.json(successResponse(result, 'Script generated successfully'));
 * }));
 */
