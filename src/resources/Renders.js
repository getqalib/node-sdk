const { TimeoutError, RenderError } = require('../errors');

/**
 * Renders resource class
 * Handles all render-related operations
 */
class Renders {
  constructor(client) {
    this.client = client;
  }

  /**
   * Create a new render from a template
   * @param {string} templateId - Template ID to render
   * @param {Array<Object>} variables - Array of variable objects
   * @param {Object} options - Additional options
   * @param {string} options.mode - Override mode: 'sync' or 'async'
   * @returns {Promise<Object>} Render result
   *
   * @example
   * // Async render (default)
   * const render = await qalib.renders.create('tmp_abc123', [
   *   { name: 'title', text: 'Hello World' },
   *   { name: 'logo', image_url: 'https://example.com/logo.png' }
   * ]);
   *
   * // Sync render (override mode)
   * const render = await qalib.renders.create('tmp_abc123', variables, { mode: 'sync' });
   */
  async create(templateId, variables, options = {}) {
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
    const mode = options.mode || this.client.mode;
    const isSync = mode === 'sync';

    // Prepare request config
    const config = {};
    if (isSync) {
      config.headers = { 'X-Sync': 'true' };
    }

    // Make API request
    const response = await this.client.post(
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
   * const render = await qalib.renders.get('3754b935-32e5-47c9-8722-bc9579347b29');
   * console.log(render.status); // 'pending', 'processing', 'completed', or 'failed'
   */
  async get(renderId) {
    if (!renderId) {
      throw new Error('Render ID is required');
    }

    const response = await this.client.get(`/render/${renderId}`);
    return response.data;
  }

  /**
   * Wait for an async render to complete
   * Polls the render status until it's completed or failed
   * @param {string} renderId - Render ID to wait for
   * @param {Object} options - Polling options
   * @param {number} options.interval - Polling interval in milliseconds (default: 1000)
   * @param {number} options.timeout - Maximum wait time in milliseconds (default: 60000)
   * @returns {Promise<Object>} Completed render object
   * @throws {TimeoutError} If render doesn't complete within timeout
   * @throws {RenderError} If render fails
   *
   * @example
   * const render = await qalib.renders.create('tmp_abc123', variables);
   * const completed = await qalib.renders.waitFor(render.id);
   * console.log(completed.image_url);
   */
  async waitFor(renderId, options = {}) {
    const interval = options.interval || 1000; // Poll every 1 second
    const timeout = options.timeout || 60000; // 60 seconds timeout
    const startTime = Date.now();

    while (true) {
      // Check if timeout exceeded
      if (Date.now() - startTime > timeout) {
        throw new TimeoutError(`Render did not complete within ${timeout}ms`);
      }

      // Get current render status
      const render = await this.get(renderId);

      // Check if completed
      if (render.status === 'completed') {
        return render;
      }

      // Check if failed
      if (render.status === 'failed') {
        throw new RenderError(
          render.error_message || 'Render failed',
          { renderId, render }
        );
      }

      // Wait before next poll (for pending or processing status)
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  /**
   * Create and wait for render to complete (convenience method)
   * Combines create() and waitFor() for async renders
   * @param {string} templateId - Template ID to render
   * @param {Array<Object>} variables - Array of variable objects
   * @param {Object} options - Options for both create and waitFor
   * @returns {Promise<Object>} Completed render object
   *
   * @example
   * const render = await qalib.renders.createAndWait('tmp_abc123', [
   *   { name: 'title', text: 'Hello World' }
   * ]);
   * console.log(render.image_url);
   */
  async createAndWait(templateId, variables, options = {}) {
    // Force async mode for this method
    const createOptions = { ...options, mode: 'async' };
    const render = await this.create(templateId, variables, createOptions);

    // Extract waitFor options
    const waitOptions = {
      interval: options.interval,
      timeout: options.timeout,
    };

    return await this.waitFor(render.id, waitOptions);
  }
}

module.exports = Renders;
