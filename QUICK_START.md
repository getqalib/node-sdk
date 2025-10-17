# Quick Start - Publishing to npm

## Installation & Setup

```bash
cd qalib-node-sdk
npm install
```

## Publishing (Simple Version)

### 1. First Time Setup

```bash
# Login to npm
npm login

# Verify you're logged in
npm whoami
```

### 2. Publish the Package

```bash
# For first publish (scoped package)
npm publish --access public

# For subsequent publishes
npm publish
```

That's it! The package is now on npm.

## Complete Publishing Workflow

For a production release:

```bash
# 1. Verify everything works
npm run verify

# 2. See what will be published
npm run pack-preview

# 3. Bump version
npm version patch  # or minor, or major

# 4. Update CHANGELOG.md
# (Edit the file manually)

# 5. Publish
npm publish

# 6. Push to git
git push origin main --tags
```

## Version Bumping

```bash
npm version patch    # 1.0.0 -> 1.0.1 (bug fixes)
npm version minor    # 1.0.0 -> 1.1.0 (new features)
npm version major    # 1.0.0 -> 2.0.0 (breaking changes)
```

## Testing Locally Before Publishing

```bash
# Create a test package
npm pack

# This creates: qalib-node-sdk-1.0.0.tgz

# Install in a test project
cd /path/to/test-project
npm install /path/to/qalib-node-sdk/qalib-node-sdk-1.0.0.tgz

# Test it
node -e "const Qalib = require('qalib-node'); console.log(Qalib)"
```

## After Publishing

Verify on npm: https://www.npmjs.com/package/qalib-node

Test installation:
```bash
npm install qalib-node
```

## Package Information

- **Package Name**: `qalib-node`
- **Main File**: `src/index.js`
- **TypeScript**: `types/index.d.ts`
- **License**: MIT
- **Node Version**: >= 14.0.0

## What Gets Published

The `files` field in `package.json` controls what's published:

- `src/` - Source code
- `types/` - TypeScript definitions
- `examples/` - Usage examples
- `README.md` - Documentation
- `LICENSE` - MIT license
- `CHANGELOG.md` - Version history

## Useful Commands

```bash
# Verify package loads
npm run verify

# Preview what will be published
npm run pack-preview

# View published package info
npm view qalib-node

# Check latest version
npm show qalib-node-sdk version

# See download stats
npm view qalib-node downloads
```

## Common Issues

**"You do not have permission to publish"**
```bash
npm login
npm whoami  # Verify correct user
```

**"Package already exists"**
- Someone else owns the name
- Use a different name or add a scope (`@yourorg/package-name`)

**"Must be logged in to publish"**
```bash
npm login
```

## Need More Details?

See [PUBLISHING.md](./PUBLISHING.md) for the complete publishing guide.
