const Qalib = require('./Qalib');
const errors = require('./errors');

// Export main class as default
module.exports = Qalib;

// Export error classes for advanced error handling
module.exports.errors = errors;
module.exports.QalibError = errors.QalibError;
module.exports.AuthenticationError = errors.AuthenticationError;
module.exports.ValidationError = errors.ValidationError;
module.exports.InsufficientCreditsError = errors.InsufficientCreditsError;
module.exports.NotFoundError = errors.NotFoundError;
module.exports.ForbiddenError = errors.ForbiddenError;
module.exports.RateLimitError = errors.RateLimitError;
module.exports.APIError = errors.APIError;
module.exports.RenderError = errors.RenderError;
module.exports.TimeoutError = errors.TimeoutError;
