# Publishing Guide

This guide explains how to build, test, and publish the Qalib Node.js SDK to npm.

## Prerequisites

1. **npm account**: Create an account at [npmjs.com](https://www.npmjs.com/signup)
2. **npm login**: Login to npm CLI
   ```bash
   npm login
   ```
3. **Organization access**: Request access to `@qalib` organization (if using scoped package)

## Package Structure

This is a **pure JavaScript package** with no build step required. The package includes:

- `src/` - Source code (published as-is)
- `types/` - TypeScript definitions
- `examples/` - Usage examples
- `README.md` - Documentation
- `LICENSE` - MIT license
- `CHANGELOG.md` - Version history

## Pre-Publish Checklist

Before publishing, verify:

### 1. Install Dependencies

```bash
cd qalib-node-sdk
npm install
```

### 2. Verify Package Loads

```bash
npm run verify
```

This runs a quick check to ensure the package can be required without errors.

### 3. Preview Package Contents

See what will be published:

```bash
npm run pack-preview
```

Or create an actual tarball:

```bash
npm pack
```

This creates a `.tgz` file you can inspect.

### 4. Test Locally

Test the package locally before publishing:

```bash
# In the SDK directory
npm link

# In a test project
npm link qalib-node

# Test it
node -e "const Qalib = require('qalib-node'); console.log(Qalib)"
```

### 5. Update Version

Update version in `package.json` using npm's version command:

```bash
# Patch release (1.0.0 -> 1.0.1)
npm version patch

# Minor release (1.0.0 -> 1.1.0)
npm version minor

# Major release (1.0.0 -> 2.0.0)
npm version major
```

### 6. Update CHANGELOG.md

Add release notes to `CHANGELOG.md`:

```markdown
## [1.0.1] - 2024-01-XX

### Fixed
- Bug fix description

### Added
- New feature description
```

## Publishing to npm

### First-Time Setup (if using scoped package)

If publishing `qalib-node` for the first time:

```bash
npm publish --access public
```

The `--access public` flag is required for scoped packages that should be publicly available.

### Regular Publishing

For subsequent releases:

```bash
npm publish
```

The `prepublishOnly` script will automatically run verification before publishing.

## Publishing Workflow (Recommended)

Complete workflow for releasing a new version:

```bash
# 1. Ensure you're on main branch and up to date
git checkout main
git pull origin main

# 2. Make sure everything works
npm install
npm run verify

# 3. Preview what will be published
npm run pack-preview

# 4. Update version (this also creates a git tag)
npm version patch -m "Release v%s"

# 5. Update CHANGELOG.md
# (Edit manually)

# 6. Commit the changelog
git add CHANGELOG.md
git commit -m "Update changelog for v$(node -p "require('./package.json').version")"

# 7. Push to git (including tags)
git push origin main --tags

# 8. Publish to npm
npm publish

# 9. Create GitHub release (optional)
# Go to https://github.com/qalib/qalib-node-sdk/releases/new
# Use the version tag and copy changelog content
```

## Version Strategy

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (x.0.0): Breaking changes
  - API signature changes
  - Removed methods
  - Changed behavior that breaks existing code

- **MINOR** (0.x.0): New features (backwards compatible)
  - New methods
  - New optional parameters
  - New error classes

- **PATCH** (0.0.x): Bug fixes (backwards compatible)
  - Bug fixes
  - Documentation updates
  - Internal improvements

## Publishing Beta/Alpha Versions

For pre-release versions:

```bash
# Set pre-release version
npm version prerelease --preid=beta
# Result: 1.0.0 -> 1.0.1-beta.0

# Publish with tag
npm publish --tag beta
```

Users can install with:
```bash
npm install qalib-node@beta
```

## Unpublishing (Emergency Only)

⚠️ **Warning**: Unpublishing is permanent and can break dependent projects.

Only unpublish if:
- Published by mistake within 24 hours
- Contains security vulnerabilities
- Contains sensitive data

```bash
# Unpublish specific version
npm unpublish qalib-node@1.0.0

# Unpublish entire package (discouraged)
npm unpublish qalib-node --force
```

Better approach: Publish a new patch version with the fix.

## Deprecating Old Versions

Instead of unpublishing, deprecate old versions:

```bash
npm deprecate qalib-node@1.0.0 "This version has a critical bug. Please upgrade to 1.0.1+"
```

## Post-Publish Verification

After publishing:

### 1. Verify on npm

Visit: https://www.npmjs.com/package/qalib-node

Check:
- Version number is correct
- README displays properly
- Package size is reasonable
- All files are included

### 2. Test Installation

In a new directory:

```bash
npm init -y
npm install qalib-node

# Test it works
node -e "const Qalib = require('qalib-node'); console.log('Version:', Qalib.version)"
```

### 3. Verify TypeScript Definitions

In a TypeScript project:

```bash
npm install qalib-node
npx tsc --noEmit
```

Should compile without errors.

## Troubleshooting

### "You do not have permission to publish"

Solution:
```bash
npm login
# Verify you're logged in as the correct user
npm whoami
```

### "Package name too similar to existing package"

Solution: npm prevents similar names. Choose a different name or contact npm support.

### "403 Forbidden"

Solution:
- Verify organization membership: `npm org ls qalib`
- Request access from organization owner

### Files missing from published package

Solution:
- Check `package.json` `files` field
- Check `.npmignore` (it overrides `.gitignore`)
- Use `npm pack` to preview

## Automated Publishing (CI/CD)

For automated publishing via GitHub Actions:

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run verify
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Set `NPM_TOKEN` in GitHub repository secrets.

## Package Maintenance

### Regular Updates

- **Dependencies**: Update axios and other dependencies regularly
  ```bash
  npm update
  npm audit fix
  ```

- **Node.js versions**: Test against new Node.js versions

- **Documentation**: Keep README and examples up to date

### Security

- Enable 2FA on npm account
- Monitor security advisories: `npm audit`
- Respond to security issues quickly

## Quick Reference

```bash
# Verify package
npm run verify

# Preview contents
npm run pack-preview

# Bump version
npm version patch|minor|major

# Publish
npm publish

# View published package
npm view qalib-node

# Check latest version
npm show qalib-node version

# Download stats
npm view qalib-node downloads
```

## Support

For issues with publishing:
- npm support: https://www.npmjs.com/support
- Organization access: Contact @qalib organization admin
