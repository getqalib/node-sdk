/**
 * Base Qalib Error class
 */
class QalibError extends Error {
  constructor(message, statusCode, code, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Authentication Error - Invalid or missing API key
 */
class AuthenticationError extends QalibError {
  constructor(message = 'Invalid or missing API key', details = null) {
    super(message, 401, 'AUTHENTICATION_ERROR', details);
  }
}

/**
 * Validation Error - Invalid request data
 */
class ValidationError extends QalibError {
  constructor(message = 'Invalid request data', details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * Insufficient Credits Error - Not enough credits
 */
class InsufficientCreditsError extends QalibError {
  constructor(message = 'Insufficient credits', details = null) {
    super(message, 402, 'INSUFFICIENT_CREDITS', details);
  }
}

/**
 * Not Found Error - Resource not found
 */
class NotFoundError extends QalibError {
  constructor(message = 'Resource not found', details = null) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

/**
 * Forbidden Error - Access denied
 */
class ForbiddenError extends QalibError {
  constructor(message = 'Access denied', details = null) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

/**
 * Rate Limit Error - Too many requests
 */
class RateLimitError extends QalibError {
  constructor(message = 'Rate limit exceeded', details = null) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', details);
  }
}

/**
 * API Error - General API error
 */
class APIError extends QalibError {
  constructor(message = 'API request failed', statusCode = 500, code = 'API_ERROR', details = null) {
    super(message, statusCode, code, details);
  }
}

/**
 * Render Error - Render operation failed
 */
class RenderError extends QalibError {
  constructor(message = 'Render operation failed', details = null) {
    super(message, 500, 'RENDER_ERROR', details);
  }
}

/**
 * Timeout Error - Request timeout
 */
class TimeoutError extends QalibError {
  constructor(message = 'Request timeout', details = null) {
    super(message, 408, 'TIMEOUT_ERROR', details);
  }
}

module.exports = {
  QalibError,
  AuthenticationError,
  ValidationError,
  InsufficientCreditsError,
  NotFoundError,
  ForbiddenError,
  RateLimitError,
  APIError,
  RenderError,
  TimeoutError,
};
