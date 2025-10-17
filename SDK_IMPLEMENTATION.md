# Qalib Node.js SDK - Implementation Summary

## Overview

Complete Node.js SDK for the Qalib Dynamic Image Generation API. The SDK provides a clean, intuitive interface for interacting with the Qalib API, supporting both synchronous and asynchronous rendering modes.

## Directory Structure

```
qalib-node-sdk/
├── src/
│   ├── index.js              # Main entry point, exports Qalib class and errors
│   ├── Qalib.js              # Main SDK class with renders/templates resources
│   ├── client.js             # HTTP client wrapper (axios-based)
│   ├── errors.js             # Custom error classes for API errors
│   └── resources/
│       ├── Renders.js        # Render operations (create, get, waitFor, createAndWait)
│       └── Templates.js      # Template operations (list, get, listAll)
├── examples/
│   ├── sync-render.js        # Synchronous rendering example
│   ├── async-render.js       # Asynchronous rendering with 3 approaches
│   └── list-templates.js     # Template listing and retrieval
├── types/
│   └── index.d.ts            # TypeScript type definitions
├── package.json              # npm package configuration
├── README.md                 # Comprehensive documentation
├── CHANGELOG.md              # Version history
├── LICENSE                   # MIT License
├── .gitignore               # Git ignore rules
└── .npmignore               # npm publish ignore rules
```

## Core Components

### 1. Main SDK Class (`src/Qalib.js`)

**Purpose**: Main entry point for the SDK

**Constructor**:
```javascript
const qalib = new Qalib({
  apiKey: 'qk_live_...',     // Required
  mode: 'sync' | 'async',     // Optional (default: 'async')
  baseURL: string,            // Optional
  timeout: number             // Optional (default: 30000ms)
});
```

**Resources**:
- `qalib.renders` - Rendering operations
- `qalib.templates` - Template operations

**Methods**:
- `health()` - Check API health status
- `setMode(mode)` - Change render mode dynamically
- `mode` getter - Get current mode

### 2. HTTP Client (`src/client.js`)

**Purpose**: Handles all HTTP communication with the Qalib API

**Features**:
- Axios-based HTTP client
- Automatic error handling and conversion to custom errors
- Bearer token authentication
- Request/response interceptors
- Timeout handling
- Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH)

**Error Mapping**:
- 400 → `ValidationError`
- 401 → `AuthenticationError`
- 402 → `InsufficientCreditsError`
- 403 → `ForbiddenError`
- 404 → `NotFoundError`
- 429 → `RateLimitError`
- 500+ → `APIError`

### 3. Error Classes (`src/errors.js`)

**Purpose**: Provide specific error types for different API error scenarios

**Available Errors**:
- `QalibError` - Base error class
- `AuthenticationError` - Invalid/missing API key
- `ValidationError` - Invalid request data
- `InsufficientCreditsError` - Not enough credits
- `NotFoundError` - Resource not found
- `ForbiddenError` - Access denied
- `RateLimitError` - Rate limit exceeded
- `APIError` - General API error
- `RenderError` - Render operation failed
- `TimeoutError` - Request/polling timeout

**Properties**:
- `message` - Error message
- `statusCode` - HTTP status code
- `code` - Error code for programmatic handling
- `details` - Additional context (when available)

### 4. Renders Resource (`src/resources/Renders.js`)

**Purpose**: Handle all render-related operations

**Methods**:

#### `create(templateId, variables, options)`
Create a new render.

```javascript
const render = await qalib.renders.create('tmp_abc123', [
  { name: 'title', text: 'Hello World' },
  { name: 'logo', image_url: 'https://...' },
  { name: 'rating', rating: 4.5 }
], { mode: 'sync' }); // Optional mode override
```

#### `get(renderId)`
Get render status and result.

```javascript
const render = await qalib.renders.get('render_id');
console.log(render.status); // pending/processing/completed/failed
```

#### `waitFor(renderId, options)`
Poll until render completes (for async renders).

```javascript
const completed = await qalib.renders.waitFor('render_id', {
  interval: 1000,  // Poll every 1s
  timeout: 60000   // Timeout after 60s
});
```

#### `createAndWait(templateId, variables, options)`
Convenience method: create and wait for completion.

```javascript
const render = await qalib.renders.createAndWait('tmp_abc123', variables);
console.log(render.image_url);
```

**Variable Types Supported**:

1. **Text Variables**:
```javascript
{
  name: 'title',
  text: 'Hello World',
  color: '#1e40af',              // Optional
  backgroundColor: '#f8f9fa',     // Optional
  backgroundHorizontalPadding: 10, // Optional
  backgroundVerticalPadding: 5    // Optional
}
```

2. **Image Variables**:
```javascript
{
  name: 'logo',
  image_url: 'https://example.com/logo.png'
}
```

3. **Rating Variables**:
```javascript
{
  name: 'rating',
  rating: 4.5  // 0-5 scale
}
```

### 5. Templates Resource (`src/resources/Templates.js`)

**Purpose**: Handle all template-related operations

**Methods**:

#### `list(options)`
List templates with pagination.

```javascript
const response = await qalib.templates.list({
  limit: 50,  // Max 100
  offset: 0
});
console.log(response.data);       // Array of templates
console.log(response.pagination); // { limit, offset, count }
```

#### `get(templateId)`
Get specific template details.

```javascript
const template = await qalib.templates.get('tmp_abc123');
```

#### `listAll(options)`
Fetch all templates (auto-pagination).

```javascript
const allTemplates = await qalib.templates.listAll({
  maxResults: 200  // Optional limit
});
```

## Usage Patterns

### Pattern 1: Synchronous Rendering
Best for: Immediate results, low-volume use cases, testing

```javascript
const qalib = new Qalib({
  apiKey: 'qk_live_...',
  mode: 'sync'
});

const render = await qalib.renders.create(templateId, variables);
console.log(render.image_url); // Available immediately
```

### Pattern 2: Asynchronous with Manual Polling
Best for: Custom polling logic, complex workflows

```javascript
const qalib = new Qalib({ apiKey: 'qk_live_...' }); // async is default

const render = await qalib.renders.create(templateId, variables);

while (true) {
  await new Promise(r => setTimeout(r, 1000));
  const status = await qalib.renders.get(render.id);

  if (status.status === 'completed') {
    console.log(status.image_url);
    break;
  }
}
```

### Pattern 3: Asynchronous with Auto-Polling (Recommended)
Best for: Most async use cases, simplest code

```javascript
const qalib = new Qalib({ apiKey: 'qk_live_...' });

const render = await qalib.renders.createAndWait(templateId, variables);
console.log(render.image_url);
```

### Pattern 4: Mixed Mode
Best for: Different requirements per operation

```javascript
const qalib = new Qalib({ apiKey: 'qk_live_...' }); // Default async

// Sync for this operation
const sync = await qalib.renders.create(id, vars, { mode: 'sync' });

// Async for this operation (uses default)
const async = await qalib.renders.create(id, vars);
await qalib.renders.waitFor(async.id);
```

## Error Handling Best Practices

```javascript
const Qalib = require('@qalib/node-sdk');

try {
  const render = await qalib.renders.create(templateId, variables);
} catch (error) {
  if (error instanceof Qalib.AuthenticationError) {
    // Handle invalid API key
    console.error('Invalid API key');
  } else if (error instanceof Qalib.InsufficientCreditsError) {
    // Handle insufficient credits
    console.error('Need more credits:', error.details.creditBalance);
  } else if (error instanceof Qalib.ValidationError) {
    // Handle validation errors
    console.error('Invalid data:', error.details);
  } else if (error instanceof Qalib.NotFoundError) {
    // Handle not found
    console.error('Template not found');
  } else if (error instanceof Qalib.RateLimitError) {
    // Handle rate limiting
    console.error('Rate limited, retry later');
  } else if (error instanceof Qalib.TimeoutError) {
    // Handle timeout
    console.error('Request timed out');
  } else {
    // Handle unknown errors
    console.error('Unknown error:', error.message);
  }
}
```

## TypeScript Support

Full TypeScript definitions included in `types/index.d.ts`.

```typescript
import Qalib, {
  Variable,
  Render,
  Template,
  RenderCreateOptions
} from '@qalib/node-sdk';

const qalib = new Qalib({
  apiKey: process.env.QALIB_API_KEY!,
  mode: 'sync'
});

const variables: Variable[] = [
  { name: 'title', text: 'Hello' },
  { name: 'logo', image_url: 'https://...' }
];

const render: Render = await qalib.renders.create('tmp_abc123', variables);
```

## API Endpoint Mapping

| SDK Method | API Endpoint | HTTP Method | Auth | Credits |
|------------|--------------|-------------|------|---------|
| `renders.create()` (sync) | `/v1/render` | POST | ✓ | 1 |
| `renders.create()` (async) | `/v1/render` | POST | ✓ | 1 |
| `renders.get()` | `/v1/render/:id` | GET | ✓ | 0 |
| `templates.list()` | `/v1/templates` | GET | ✓ | 0 |
| `templates.get()` | `/v1/templates/:id` | GET | ✓ | 0 |
| `health()` | `/v1/health` | GET | - | 0 |

## Rate Limiting

The SDK respects API rate limits:
- 100 requests per 15 minutes per IP
- Additional per-API-key limits may apply
- Throws `RateLimitError` when exceeded

## Credits System

- Each render costs 1 credit
- Credits deducted before processing
- Balance returned in render response:
  ```javascript
  const render = await qalib.renders.create(...);
  console.log('Used:', render.credits_deducted);
  console.log('Remaining:', render.remaining_credits);
  ```

## Installation & Publishing

### Local Development
```bash
cd qalib-node-sdk
npm install
```

### Publishing to npm
```bash
# Update version in package.json
npm version patch|minor|major

# Publish
npm publish --access public
```

### Installation by Users
```bash
npm install @qalib/node-sdk
```

## Examples

See `/examples` directory for complete working examples:
- `sync-render.js` - Synchronous rendering
- `async-render.js` - All async patterns
- `list-templates.js` - Template management

## Testing

To test the SDK:

```bash
export QALIB_API_KEY=qk_live_your_key
node examples/sync-render.js
node examples/async-render.js
node examples/list-templates.js
```

## Key Design Decisions

1. **Resource-based Architecture**: Clean separation of concerns with `renders` and `templates` resources
2. **Mode Flexibility**: Support both sync and async at SDK and method level
3. **Smart Polling**: `waitFor()` and `createAndWait()` abstractions for common async pattern
4. **Comprehensive Errors**: Specific error classes for each API error scenario
5. **TypeScript First-Class**: Full type definitions for enhanced developer experience
6. **Axios Foundation**: Reliable HTTP client with interceptors and error handling
7. **Minimal Dependencies**: Only axios required, keeping bundle size small

## Future Enhancements

Potential future additions:
- Webhooks support for async completion notifications
- Retry logic with exponential backoff
- Request caching layer
- Batch rendering support
- Progress callbacks for waitFor
- Stream-based rendering for large templates
- CLI tool for common operations

## Support & Documentation

- Full documentation: README.md
- API reference: https://docs.getqalib.com/api-reference
- Examples: `/examples` directory
- Type definitions: `/types/index.d.ts`
- Issues: GitHub Issues

## License

MIT License - See LICENSE file
