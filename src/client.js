const axios = require('axios');
const {
  AuthenticationError,
  ValidationError,
  InsufficientCreditsError,
  NotFoundError,
  ForbiddenError,
  RateLimitError,
  APIError,
  TimeoutError,
} = require('./errors');

/**
 * HTTP Client for Qalib API
 */
class Client {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://api.getqalib.com/v1';
    this.timeout = config.timeout || 30000; // 30 seconds default
    this.mode = config.mode || 'async'; // 'sync' or 'async'

    if (!this.apiKey) {
      throw new AuthenticationError('API key is required');
    }

    if (!this.apiKey.startsWith('qk_')) {
      throw new AuthenticationError('Invalid API key format. API key must start with "qk_"');
    }

    // Create axios instance
    this.axios = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'User-Agent': 'qalib-node-sdk/1.0.0',
      },
    });

    // Add response interceptor for error handling
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => this._handleError(error)
    );
  }

  /**
   * Handle API errors and convert to custom error classes
   */
  _handleError(error) {
    if (error.code === 'ECONNABORTED') {
      throw new TimeoutError('Request timeout');
    }

    if (!error.response) {
      throw new APIError(
        error.message || 'Network error occurred',
        500,
        'NETWORK_ERROR'
      );
    }

    const { status, data } = error.response;
    const message = data?.message || data?.error || 'Unknown error occurred';
    const code = data?.code || 'UNKNOWN_ERROR';
    const details = data?.details || null;

    switch (status) {
      case 400:
        throw new ValidationError(message, details);
      case 401:
        throw new AuthenticationError(message, details);
      case 402:
        throw new InsufficientCreditsError(message, {
          creditBalance: data?.creditBalance,
          requiredCredits: data?.requiredCredits,
          ...details,
        });
      case 403:
        throw new ForbiddenError(message, details);
      case 404:
        throw new NotFoundError(message, details);
      case 429:
        throw new RateLimitError(message, details);
      default:
        throw new APIError(message, status, code, details);
    }
  }

  /**
   * Make GET request
   */
  async get(path, config = {}) {
    const response = await this.axios.get(path, config);
    return response.data;
  }

  /**
   * Make POST request
   */
  async post(path, data = {}, config = {}) {
    const response = await this.axios.post(path, data, config);
    return response.data;
  }

  /**
   * Make PUT request
   */
  async put(path, data = {}, config = {}) {
    const response = await this.axios.put(path, data, config);
    return response.data;
  }

  /**
   * Make DELETE request
   */
  async delete(path, config = {}) {
    const response = await this.axios.delete(path, config);
    return response.data;
  }

  /**
   * Make PATCH request
   */
  async patch(path, data = {}, config = {}) {
    const response = await this.axios.patch(path, data, config);
    return response.data;
  }
}

module.exports = Client;
