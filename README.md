# Qalib Node.js SDK

Official Node.js SDK for Qalib - Dynamic Image Generation API

[![npm version](https://img.shields.io/npm/v/qalib-node.svg)](https://www.npmjs.com/package/qalib-node)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install qalib-node
```

## Quick Start

```javascript
const Qalib = require('qalib-node');

// Initialize the client
const qalib = new Qalib({
  apiKey: 'qk_live_your_api_key',
  mode: 'sync' // or 'async' (default)
});

// Render an image
const render = await qalib.renderImage('tmp_your_template_id', [
  { name: 'title', text: 'Hello World!' },
  { name: 'logo', image_url: 'https://example.com/logo.png' }
]);

console.log(render.image_url);
```

## Configuration

```javascript
const qalib = new Qalib({
  apiKey: string,        // Required: Your Qalib API key
  mode: string,          // Optional: 'sync' or 'async' (default: 'async')
  baseURL: string,       // Optional: Custom API base URL
  timeout: number,       // Optional: Request timeout in ms (default: 30000)
});
```

**Get your API key** from the [Qalib Dashboard](https://getqalib.com/dashboard/api-keys)

## API Methods

### Rendering

#### `renderImage(templateId, variables, options)`

Render an image from a template.

```javascript
// Sync mode (immediate result)
const qalib = new Qalib({ apiKey: 'qk_live_...', mode: 'sync' });
const render = await qalib.renderImage('tmp_abc123', [
  { name: 'title', text: 'Hello World' },
  { name: 'logo', image_url: 'https://example.com/logo.png' },
  { name: 'rating', rating: 4.5 }
]);

console.log(render.image_url);       // Image URL
console.log(render.render_time_ms);  // Render time
console.log(render.credits_deducted); // Credits used

// Async mode (queued, returns immediately)
const qalib = new Qalib({ apiKey: 'qk_live_...' }); // async is default
const render = await qalib.renderImage('tmp_abc123', variables);
console.log(render.id);     // Render ID for tracking
console.log(render.status); // 'pending'

// Override mode per request
const render = await qalib.renderImage('tmp_abc123', variables, { mode: 'sync' });
```

#### `getRender(renderId)`

Get render status and result (for async renders).

```javascript
const render = await qalib.getRender('3754b935-32e5-47c9-8722-bc9579347b29');
console.log(render.status); // 'pending', 'processing', 'completed', or 'failed'

if (render.status === 'completed') {
  console.log(render.image_url);
} else if (render.status === 'failed') {
  console.error(render.error_message);
}
```

### Templates

#### `listTemplates(options)`

List templates with pagination.

```javascript
const response = await qalib.listTemplates({
  limit: 50,  // Max 100, default 50
  offset: 0   // Default 0
});

console.log(response.data);       // Array of templates
console.log(response.pagination); // { limit, offset, count }

// Example output
for (const template of response.data) {
  console.log(template.id, template.name, `${template.width}x${template.height}`);
}
```

#### `getTemplate(templateId)`

Get specific template details.

```javascript
const template = await qalib.getTemplate('tmp_abc123');
console.log(template.name);
console.log(template.width, template.height);
console.log(template.created_at);
```

#### `listAllTemplates(options)`

Fetch all templates (auto-pagination).

```javascript
const allTemplates = await qalib.listAllTemplates({
  maxResults: 200 // Optional limit
});

console.log(`Total: ${allTemplates.length} templates`);
```

### Utility

#### `health()`

Check API health status.

```javascript
const health = await qalib.health();
console.log(health.status); // 'success'
```

#### `setMode(mode)`

Change render mode after initialization.

```javascript
qalib.setMode('sync');  // Switch to sync mode
qalib.setMode('async'); // Switch to async mode
```

## Variable Types

### Text Variables

```javascript
{
  name: 'title',
  text: 'Hello World',
  // Optional styling:
  color: '#1e40af',
  backgroundColor: '#f8f9fa',
  backgroundHorizontalPadding: 10,
  backgroundVerticalPadding: 5
}
```

### Image Variables

```javascript
{
  name: 'logo',
  image_url: 'https://example.com/logo.png'
}
```

### Rating Variables

```javascript
{
  name: 'rating',
  rating: 4.5  // 0-5 scale
}
```

## Error Handling

The SDK provides specific error classes for different scenarios:

```javascript
const Qalib = require('qalib-node');

try {
  const render = await qalib.renderImage(templateId, variables);
} catch (error) {
  if (error instanceof Qalib.AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof Qalib.InsufficientCreditsError) {
    console.error('Not enough credits:', error.details.creditBalance);
  } else if (error instanceof Qalib.ValidationError) {
    console.error('Invalid request:', error.details);
  } else if (error instanceof Qalib.NotFoundError) {
    console.error('Template not found');
  } else if (error instanceof Qalib.RateLimitError) {
    console.error('Rate limit exceeded');
  } else if (error instanceof Qalib.TimeoutError) {
    console.error('Request timeout');
  } else if (error instanceof Qalib.RenderError) {
    console.error('Render failed:', error.message);
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

### Available Error Classes

- `AuthenticationError` - Invalid/missing API key (401)
- `ValidationError` - Invalid request data (400)
- `InsufficientCreditsError` - Not enough credits (402)
- `NotFoundError` - Resource not found (404)
- `ForbiddenError` - Access denied (403)
- `RateLimitError` - Rate limit exceeded (429)
- `TimeoutError` - Request timeout (408)
- `RenderError` - Render operation failed
- `APIError` - General API error (500+)
- `QalibError` - Base error class

All errors include:
- `message` - Error message
- `statusCode` - HTTP status code
- `code` - Error code for programmatic handling
- `details` - Additional context (when available)

## Usage Patterns

### Pattern 1: Synchronous Rendering

Best for: Immediate results, low-volume, testing

```javascript
const qalib = new Qalib({ apiKey: 'qk_live_...', mode: 'sync' });
const render = await qalib.renderImage(templateId, variables);
console.log(render.image_url); // Available immediately
```

### Pattern 2: Asynchronous with Polling

Best for: High-volume, background processing

```javascript
const qalib = new Qalib({ apiKey: 'qk_live_...' }); // async is default

// Create render (returns immediately)
const render = await qalib.renderImage(templateId, variables);
console.log(render.id); // Save this ID for polling

// Poll for completion
let completed = false;
while (!completed) {
  await new Promise(r => setTimeout(r, 1000)); // Wait 1 second

  const status = await qalib.getRender(render.id);

  if (status.status === 'completed') {
    console.log(status.image_url);
    completed = true;
  } else if (status.status === 'failed') {
    console.error(status.error_message);
    break;
  }
}
```

## Examples

See the [examples](./examples) directory for complete working examples:

- [sync-render.js](./examples/sync-render.js) - Synchronous rendering
- [async-render.js](./examples/async-render.js) - Asynchronous rendering with polling
- [list-templates.js](./examples/list-templates.js) - Working with templates

Run examples:
```bash
export QALIB_API_KEY=qk_live_your_key
node examples/sync-render.js
node examples/async-render.js
node examples/list-templates.js
```

## TypeScript Support

Full TypeScript definitions included:

```typescript
import Qalib, { Variable, Render } from 'qalib-node';

const qalib = new Qalib({
  apiKey: process.env.QALIB_API_KEY!,
  mode: 'sync'
});

const variables: Variable[] = [
  { name: 'title', text: 'Hello' },
  { name: 'logo', image_url: 'https://...' }
];

const render: Render = await qalib.renderImage('tmp_abc123', variables);
```

## Rate Limiting & Credits

**Rate Limits:**
- 100 requests per 15 minutes per IP
- Additional per-API-key limits may apply
- Throws `RateLimitError` when exceeded

**Credits:**
- Each render costs 1 credit
- Credits deducted before processing
- Balance returned in response:

```javascript
const render = await qalib.renderImage(templateId, variables);
console.log('Credits used:', render.credits_deducted);
console.log('Remaining:', render.remaining_credits);
```

## API Reference

| Method | Description | Returns |
|--------|-------------|---------|
| `renderImage(templateId, variables, options)` | Render an image | `Promise<Render>` |
| `getRender(renderId)` | Get render status | `Promise<Render>` |
| `listTemplates(options)` | List templates | `Promise<TemplatesListResponse>` |
| `getTemplate(templateId)` | Get template details | `Promise<Template>` |
| `listAllTemplates(options)` | Get all templates | `Promise<Template[]>` |
| `health()` | API health check | `Promise<HealthResponse>` |
| `setMode(mode)` | Change render mode | `void` |

## Support

- **Documentation**: [https://docs.getqalib.com](https://docs.getqalib.com)
- **API Reference**: [https://docs.getqalib.com/api-reference](https://docs.getqalib.com/api-reference)
- **Issues**: [GitHub Issues](https://github.com/qalib/qalib-node-sdk/issues)
- **Email**: support@getqalib.com

## License

MIT License - see [LICENSE](LICENSE) file for details

---

Made with ❤️ by the Qalib team
