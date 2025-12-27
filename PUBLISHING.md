# Publishing to npm

This guide walks through publishing `bruno-openapi-converter` to npm.

## Prerequisites

1. **npm Account**: Create one at https://www.npmjs.com/signup if you don't have one
2. **npm CLI**: Installed with Node.js
3. **Repository Access**: Push access to the GitHub repository

## Pre-Publishing Checklist

- [ ] All tests pass (if you have tests)
- [ ] README.md is up to date
- [ ] CHANGELOG.md exists and is updated (optional but recommended)
- [ ] Version number is correct in package.json
- [ ] All changes are committed and pushed to GitHub
- [ ] Repository URL in package.json is correct
- [ ] Author field is filled in package.json
- [ ] License file exists (LICENSE or LICENSE.md)

## Step-by-Step Publishing Process

### 1. Login to npm

```bash
npm login
```

You'll be prompted for:
- Username
- Password
- Email
- One-time password (if 2FA is enabled)

Verify you're logged in:
```bash
npm whoami
```

### 2. Check Package Name Availability

```bash
npm search bruno-openapi-converter
```

If the name is taken, you'll need to either:
- Choose a different name (update `name` in package.json)
- Use a scoped package: `@yourusername/bruno-openapi-converter`

### 3. Test the Package Locally

Before publishing, test that the package works:

```bash
# Create a test package
npm pack
```

This creates a `.tgz` file. Test it in another directory:

```bash
cd /tmp
mkdir test-install
cd test-install
npm install /path/to/bruno-openapi-converter-1.0.0.tgz

# Test the CLI
npx openapi-to-bruno --help
```

### 4. Review What Will Be Published

```bash
npm publish --dry-run
```

This shows exactly what files will be included. The `files` field in package.json controls this.

### 5. Publish to npm

For the first publish:

```bash
npm publish
```

For subsequent updates:

```bash
# Update version first
npm version patch  # 1.0.0 -> 1.0.1
# or
npm version minor  # 1.0.0 -> 1.1.0
# or
npm version major  # 1.0.0 -> 2.0.0

# Then publish
npm publish
```

### 6. Verify Publication

Check your package on npm:
```bash
npm view bruno-openapi-converter
```

Or visit: https://www.npmjs.com/package/bruno-openapi-converter

### 7. Test Installation

```bash
npm install -g bruno-openapi-converter
openapi-to-bruno --version
```

## Version Management

### Semantic Versioning (SemVer)

- **MAJOR** (1.0.0 -> 2.0.0): Breaking changes
- **MINOR** (1.0.0 -> 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 -> 1.0.1): Bug fixes, backward compatible

### Updating Versions

```bash
# Patch release (bug fixes)
npm version patch -m "Fix: description of fix"

# Minor release (new features)
npm version minor -m "Feature: description of feature"

# Major release (breaking changes)
npm version major -m "Breaking: description of breaking change"

# Then push tags
git push && git push --tags

# Then publish
npm publish
```

## Publishing Scoped Packages

If you want to publish under your username/organization:

1. Update package.json:
```json
{
  "name": "@rreyn-bruno/bruno-openapi-converter"
}
```

2. Publish as public (scoped packages are private by default):
```bash
npm publish --access public
```

## Automation with GitHub Actions

Create `.github/workflows/publish.yml`:

```yaml
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
      - run: npm test
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Then create releases on GitHub to trigger automatic publishing.

## Post-Publishing

1. **Add npm badge to README**:
```markdown
[![npm version](https://badge.fury.io/js/bruno-openapi-converter.svg)](https://www.npmjs.com/package/bruno-openapi-converter)
[![npm downloads](https://img.shields.io/npm/dm/bruno-openapi-converter.svg)](https://www.npmjs.com/package/bruno-openapi-converter)
```

2. **Update documentation** with installation instructions

3. **Announce** on relevant communities (Bruno Discord, Twitter, etc.)

## Troubleshooting

### "Package name already exists"
- Choose a different name or use a scoped package

### "You must be logged in to publish"
- Run `npm login` again

### "You do not have permission to publish"
- Check if you're logged in with the correct account
- Check if the package name is owned by someone else

### "Version already exists"
- Update the version number in package.json
- Use `npm version patch/minor/major`

## Best Practices

1. **Always test before publishing**: Use `npm pack` and test locally
2. **Use semantic versioning**: Follow SemVer strictly
3. **Keep a CHANGELOG**: Document all changes
4. **Tag releases**: Use git tags for versions
5. **Use .npmignore**: Exclude unnecessary files (or use `files` in package.json)
6. **Enable 2FA**: Protect your npm account
7. **Use npm scripts**: Automate testing and building

## Quick Reference

```bash
# Login
npm login

# Check what will be published
npm publish --dry-run

# Publish
npm publish

# Update version and publish
npm version patch
npm publish

# Unpublish (within 72 hours)
npm unpublish bruno-openapi-converter@1.0.0

# Deprecate a version
npm deprecate bruno-openapi-converter@1.0.0 "Use version 1.0.1 instead"
```

