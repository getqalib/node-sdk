/**
 * Templates resource class
 * Handles all template-related operations
 */
class Templates {
  constructor(client) {
    this.client = client;
  }

  /**
   * List all templates owned by the authenticated user
   * @param {Object} options - Pagination options
   * @param {number} options.limit - Number of templates to return (max 100, default 50)
   * @param {number} options.offset - Number of templates to skip (default 0)
   * @returns {Promise<Object>} List of templates with pagination info
   *
   * @example
   * const templates = await qalib.templates.list({ limit: 10, offset: 0 });
   * console.log(templates.data); // Array of template objects
   * console.log(templates.pagination); // { limit, offset, count }
   */
  async list(options = {}) {
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

    const response = await this.client.get('/templates', {
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
   * const template = await qalib.templates.get('tmp_abc123');
   * console.log(template.name); // Template name
   * console.log(template.width, template.height); // Dimensions
   */
  async get(templateId) {
    if (!templateId) {
      throw new Error('Template ID is required');
    }

    const response = await this.client.get(`/templates/${templateId}`);
    return response.data;
  }

  /**
   * List all templates (convenience method that fetches all pages)
   * @param {Object} options - Options
   * @param {number} options.maxResults - Maximum number of results to fetch (default: unlimited)
   * @returns {Promise<Array>} Array of all templates
   *
   * @example
   * const allTemplates = await qalib.templates.listAll({ maxResults: 200 });
   * console.log(allTemplates.length); // Total number of templates
   */
  async listAll(options = {}) {
    const maxResults = options.maxResults || Infinity;
    const templates = [];
    let offset = 0;
    const limit = 100; // Use max limit for efficiency

    while (templates.length < maxResults) {
      const response = await this.list({ limit, offset });

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
}

module.exports = Templates;
