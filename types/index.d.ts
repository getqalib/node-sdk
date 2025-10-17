// TypeScript definitions for qalib-node

declare module 'qalib-node' {
  /**
   * Qalib configuration options
   */
  export interface QalibConfig {
    /** Qalib API key (required) */
    apiKey: string;
    /** Render mode: 'sync' or 'async' (default: 'async') */
    mode?: 'sync' | 'async';
    /** Custom API base URL */
    baseURL?: string;
    /** Request timeout in milliseconds (default: 30000) */
    timeout?: number;
  }

  /**
   * Text variable with optional styling
   */
  export interface TextVariable {
    name: string;
    text: string;
    /** Text color in hex format (e.g., '#1e40af') */
    color?: string;
    /** Background color in hex format */
    backgroundColor?: string;
    /** Horizontal padding in pixels (0-100) */
    backgroundHorizontalPadding?: number;
    /** Vertical padding in pixels (0-100) */
    backgroundVerticalPadding?: number;
  }

  /**
   * Image variable
   */
  export interface ImageVariable {
    name: string;
    image_url: string;
  }

  /**
   * Rating variable
   */
  export interface RatingVariable {
    name: string;
    /** Rating value from 0 to 5 */
    rating: number;
  }

  /**
   * Variable type (union of all variable types)
   */
  export type Variable = TextVariable | ImageVariable | RatingVariable;

  /**
   * Render status
   */
  export type RenderStatus = 'pending' | 'processing' | 'completed' | 'failed';

  /**
   * Render object
   */
  export interface Render {
    /** Unique render identifier */
    id: string;
    /** Current render status */
    status: RenderStatus;
    /** Self URL for this render */
    self: string;
    /** Template ID used */
    template_id: string;
    /** Variables that were used */
    variables_used: Record<string, any>;
    /** When the render was requested */
    requested_at: string;
    /** URL to the rendered image (only when completed) */
    image_url?: string;
    /** Render time in milliseconds (only when completed) */
    render_time_ms?: number;
    /** When the render completed (only when completed) */
    completed_at?: string;
    /** Error message (only when failed) */
    error_message?: string;
    /** When the render failed (only when failed) */
    failed_at?: string;
    /** When processing started (only when processing) */
    started_at?: string;
    /** Credits deducted for this render */
    credits_deducted?: number;
    /** Remaining credit balance */
    remaining_credits?: number;
  }

  /**
   * Template metadata object
   */
  export interface Template {
    /** Template ID */
    id: string;
    /** Template name */
    name: string;
    /** Template description */
    description?: string;
    /** Template width in pixels */
    width: number;
    /** Template height in pixels */
    height: number;
    /** When the template was created */
    created_at: string;
  }

  /**
   * Pagination information
   */
  export interface Pagination {
    /** Number of results per page */
    limit: number;
    /** Number of results skipped */
    offset: number;
    /** Number of results in current page */
    count: number;
  }

  /**
   * Templates list response
   */
  export interface TemplatesListResponse {
    /** Status indicator */
    status: string;
    /** Array of templates */
    data: Template[];
    /** Pagination information */
    pagination: Pagination;
  }

  /**
   * Options for rendering an image
   */
  export interface RenderImageOptions {
    /** Override the default mode for this render */
    mode?: 'sync' | 'async';
  }


  /**
   * Options for listing templates
   */
  export interface ListTemplatesOptions {
    /** Number of templates to return (max 100, default 50) */
    limit?: number;
    /** Number of templates to skip (default 0) */
    offset?: number;
  }

  /**
   * Options for listing all templates
   */
  export interface ListAllTemplatesOptions {
    /** Maximum number of results to fetch */
    maxResults?: number;
  }

  /**
   * Health check response
   */
  export interface HealthResponse {
    status: string;
    message: string;
    timestamp: string;
    version: string;
  }

  /**
   * Base Qalib Error
   */
  export class QalibError extends Error {
    statusCode: number;
    code: string;
    details: any;
    constructor(message: string, statusCode: number, code: string, details?: any);
  }

  /**
   * Authentication Error (401)
   */
  export class AuthenticationError extends QalibError {
    constructor(message?: string, details?: any);
  }

  /**
   * Validation Error (400)
   */
  export class ValidationError extends QalibError {
    constructor(message?: string, details?: any);
  }

  /**
   * Insufficient Credits Error (402)
   */
  export class InsufficientCreditsError extends QalibError {
    constructor(message?: string, details?: any);
  }

  /**
   * Not Found Error (404)
   */
  export class NotFoundError extends QalibError {
    constructor(message?: string, details?: any);
  }

  /**
   * Forbidden Error (403)
   */
  export class ForbiddenError extends QalibError {
    constructor(message?: string, details?: any);
  }

  /**
   * Rate Limit Error (429)
   */
  export class RateLimitError extends QalibError {
    constructor(message?: string, details?: any);
  }

  /**
   * API Error (500)
   */
  export class APIError extends QalibError {
    constructor(message?: string, statusCode?: number, code?: string, details?: any);
  }

  /**
   * Render Error
   */
  export class RenderError extends QalibError {
    constructor(message?: string, details?: any);
  }

  /**
   * Timeout Error (408)
   */
  export class TimeoutError extends QalibError {
    constructor(message?: string, details?: any);
  }

  /**
   * Main Qalib SDK class
   */
  export default class Qalib {
    /**
     * Create a new Qalib client instance
     */
    constructor(config: QalibConfig);

    /**
     * Render an image from a template
     */
    renderImage(
      templateId: string,
      variables: Variable[],
      options?: RenderImageOptions
    ): Promise<Render>;

    /**
     * Get render status and result
     */
    getRender(renderId: string): Promise<Render>;

    /**
     * List templates with pagination
     */
    listTemplates(options?: ListTemplatesOptions): Promise<TemplatesListResponse>;

    /**
     * Get a specific template
     */
    getTemplate(templateId: string): Promise<Template>;

    /**
     * List all templates (auto-pagination)
     */
    listAllTemplates(options?: ListAllTemplatesOptions): Promise<Template[]>;

    /**
     * Get API health status
     */
    health(): Promise<HealthResponse>;

    /**
     * Get current SDK version
     */
    static version: string;

    /**
     * Get current render mode
     */
    get mode(): 'sync' | 'async';

    /**
     * Update the render mode
     */
    setMode(mode: 'sync' | 'async'): void;

    /** Error classes */
    static errors: {
      QalibError: typeof QalibError;
      AuthenticationError: typeof AuthenticationError;
      ValidationError: typeof ValidationError;
      InsufficientCreditsError: typeof InsufficientCreditsError;
      NotFoundError: typeof NotFoundError;
      ForbiddenError: typeof ForbiddenError;
      RateLimitError: typeof RateLimitError;
      APIError: typeof APIError;
      RenderError: typeof RenderError;
      TimeoutError: typeof TimeoutError;
    };
  }

  /** Export error classes */
  export const errors: {
    QalibError: typeof QalibError;
    AuthenticationError: typeof AuthenticationError;
    ValidationError: typeof ValidationError;
    InsufficientCreditsError: typeof InsufficientCreditsError;
    NotFoundError: typeof NotFoundError;
    ForbiddenError: typeof ForbiddenError;
    RateLimitError: typeof RateLimitError;
    APIError: typeof APIError;
    RenderError: typeof RenderError;
    TimeoutError: typeof TimeoutError;
  };
}
