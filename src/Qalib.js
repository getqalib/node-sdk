const Client = require('./client');

/**
 * Qalib SDK
 * Official Node.js client for the Qalib API
 *
 * @example
 * const Qalib = require('@qalib/node-sdk');
 *
 * // Initialize with sync mode
 * const qalib = new Qalib({
 *   apiKey: 'qk_live_your_api_key',
 *   mode: 'sync'
 * });
 *
 * // Render an image
 * const render = await qalib.renderImage('tmp_abc123', variables);
 */
class Qalib {
  /**
   * Create a new Qalib client instance
   * @param {Object} config - Configuration options
   * @param {string} config.apiKey - Qalib API key (required)
   * @param {string} config.mode - Render mode: 'sync' or 'async' (default: 'async')
   * @param {string} config.baseURL - Custom base URL (default: 'https://api.getqalib.com/v1')
   * @param {number} config.timeout - Request timeout in milliseconds (default: 30000)
   */
  constructor(config = {}) {
    // Validate config
    if (!config.apiKey) {
      throw new Error('apiKey is required');
    }

    // Validate mode
    if (config.mode && !['sync', 'async'].includes(config.mode)) {
      throw new Error('mode must be either "sync" or "async"');
    }

    // Create HTTP client
    this._client = new Client({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      timeout: config.timeout,
      mode: config.mode || 'async',
    });
  }

  /**
   * Render an image from a template
   * @param {string} templateId - Template ID to render
   * @param {Array<Object>} variables - Array of variable objects
   * @param {Object} options - Additional options
   * @param {string} options.mode - Override mode: 'sync' or 'async'
   * @returns {Promise<Object>} Render result
   *
   * @example
   * // Async render (default)
   * const render = await qalib.renderImage('tmp_abc123', [
   *   { name: 'title', text: 'Hello World' },
   *   { name: 'logo', image_url: 'https://example.com/logo.png' }
   * ]);
   *
   * // Sync render (override mode)
   * const render = await qalib.renderImage('tmp_abc123', variables, { mode: 'sync' });
   */
  async renderImage(templateId, variables, options = {}) {
    // Validate inputs
    if (!templateId) {
      throw new Error('Template ID is required');
    }

    if (!Array.isArray(variables) || variables.length === 0) {
      throw new Error('Variables must be a non-empty array');
    }

    // Validate each variable has a name and at least one value property
    for (const variable of variables) {
      if (!variable.name) {
        throw new Error('Each variable must have a name property');
      }
      if (!variable.text && !variable.image_url && variable.rating === undefined) {
        throw new Error(`Variable "${variable.name}" must have either text, image_url, or rating property`);
      }
    }

    // Determine mode (option > client default)
    const mode = options.mode || this._client.mode;
    const isSync = mode === 'sync';

    // Prepare request config
    const config = {};
    if (isSync) {
      config.headers = { 'X-Sync': 'true' };
    }

    // Make API request
    const response = await this._client.post(
      '/render',
      {
        template: templateId,
        variables: variables,
      },
      config
    );

    return response.data;
  }

  /**
   * Get render status and result
   * @param {string} renderId - Render ID
   * @returns {Promise<Object>} Render object with status
   *
   * @example
   * const render = await qalib.getRender('3754b935-32e5-47c9-8722-bc9579347b29');
   * console.log(render.status); // 'pending', 'processing', 'completed', or 'failed'
   */
  async getRender(renderId) {
    if (!renderId) {
      throw new Error('Render ID is required');
    }

    const response = await this._client.get(`/render/${renderId}`);
    return response.data;
  }

  /**
   * List all templates owned by the authenticated user
   * @param {Object} options - Pagination options
   * @param {number} options.limit - Number of templates to return (max 100, default 50)
   * @param {number} options.offset - Number of templates to skip (default 0)
   * @returns {Promise<Object>} List of templates with pagination info
   *
   * @example
   * const templates = await qalib.listTemplates({ limit: 10, offset: 0 });
   * console.log(templates.data); // Array of template objects
   * console.log(templates.pagination); // { limit, offset, count }
   */
  async listTemplates(options = {}) {
    const limit = options.limit || 50;
    const offset = options.offset || 0;

    if (limit > 100) {
      throw new Error('Limit cannot exceed 100');
    }

    if (limit < 1) {
      throw new Error('Limit must be at least 1');
    }

    if (offset < 0) {
      throw new Error('Offset cannot be negative');
    }

    const response = await this._client.get('/templates', {
      params: {
        limit,
        offset,
      },
    });

    return response;
  }

  /**
   * Get a specific template by ID
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} Template object with metadata
   *
   * @example
   * const template = await qalib.getTemplate('tmp_abc123');
   * console.log(template.name); // Template name
   * console.log(template.width, template.height); // Dimensions
   */
  async getTemplate(templateId) {
    if (!templateId) {
      throw new Error('Template ID is required');
    }

    const response = await this._client.get(`/templates/${templateId}`);
    return response.data;
  }

  /**
   * List all templates (convenience method that fetches all pages)
   * @param {Object} options - Options
   * @param {number} options.maxResults - Maximum number of results to fetch (default: unlimited)
   * @returns {Promise<Array>} Array of all templates
   *
   * @example
   * const allTemplates = await qalib.listAllTemplates({ maxResults: 200 });
   * console.log(allTemplates.length); // Total number of templates
   */
  async listAllTemplates(options = {}) {
    const maxResults = options.maxResults || Infinity;
    const templates = [];
    let offset = 0;
    const limit = 100; // Use max limit for efficiency

    while (templates.length < maxResults) {
      const response = await this.listTemplates({ limit, offset });

      if (response.data.length === 0) {
        break; // No more templates
      }

      templates.push(...response.data);
      offset += response.data.length;

      // Stop if we got fewer results than requested (last page)
      if (response.data.length < limit) {
        break;
      }
    }

    // Trim to maxResults if specified
    return templates.slice(0, maxResults);
  }

  /**
   * Get API health status
   * @returns {Promise<Object>} Health status
   *
   * @example
   * const health = await qalib.health();
   * console.log(health.status); // 'success'
   */
  async health() {
    return await this._client.get('/health');
  }

  /**
   * Get current SDK version
   * @returns {string} Version string
   */
  static get version() {
    return '1.0.0';
  }

  /**
   * Get current mode
   * @returns {string} Current mode ('sync' or 'async')
   */
  get mode() {
    return this._client.mode;
  }

  /**
   * Update the mode after initialization
   * @param {string} mode - New mode: 'sync' or 'async'
   */
  setMode(mode) {
    if (!['sync', 'async'].includes(mode)) {
      throw new Error('mode must be either "sync" or "async"');
    }
    this._client.mode = mode;
  }
}

module.exports = Qalib;
