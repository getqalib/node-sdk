# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added
- Initial release of Qalib Node.js SDK
- Support for synchronous and asynchronous rendering modes
- `Renders` resource with `create()`, `get()`, `waitFor()`, and `createAndWait()` methods
- `Templates` resource with `list()`, `get()`, and `listAll()` methods
- Comprehensive error handling with custom error classes
- TypeScript type definitions
- Support for text, image, and rating variables
- Automatic polling for async renders with `waitFor()`
- Configuration options for baseURL and timeout
- Health check endpoint support
- Complete documentation and examples

### Features
- **Sync Mode**: Immediate rendering with results returned before request completes
- **Async Mode**: Background rendering with polling support
- **Smart Polling**: Automatic status checking with configurable intervals and timeouts
- **Error Handling**: Custom error classes for different API error scenarios
- **TypeScript**: Full type definitions included
- **Pagination**: Support for paginated template listing
- **Variable Styling**: Support for text color, background, and padding customization

[1.0.0]: https://github.com/qalib/qalib-node-sdk/releases/tag/v1.0.0
