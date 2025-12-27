# Quick Publish Guide

## Ready to Publish? Follow These Steps:

### 1. Commit the Latest Changes

```bash
git add -A
git commit -m "Prepare for npm publishing

- Add LICENSE file
- Add .npmignore to exclude dev files
- Update package.json with repository info and files list
- Add PUBLISHING.md guide"
git push origin main
```

### 2. Login to npm

```bash
npm login
```

Enter your npm credentials. If you don't have an account, create one at https://www.npmjs.com/signup

### 3. Check Package Name Availability

```bash
npm search bruno-openapi-converter
```

If the name is taken, you have two options:
- Choose a different name
- Use a scoped package: `@rreyn-bruno/bruno-openapi-converter`

### 4. Test the Package Locally

```bash
# Create a test package
npm pack

# This creates: bruno-openapi-converter-1.0.0.tgz
# Test it in another directory:
cd /tmp
mkdir test-install
cd test-install
npm install ~/Desktop/bruno-openapi-converter/bruno-openapi-converter-1.0.0.tgz

# Test the CLI
npx openapi-to-bruno --help

# Clean up
cd ~/Desktop/bruno-openapi-converter
rm bruno-openapi-converter-1.0.0.tgz
```

### 5. Preview What Will Be Published

```bash
npm publish --dry-run
```

This shows exactly what files will be included in the package.

### 6. Publish to npm!

```bash
npm publish
```

If using a scoped package:
```bash
npm publish --access public
```

### 7. Verify Publication

```bash
# Check package info
npm view bruno-openapi-converter

# Or visit
# https://www.npmjs.com/package/bruno-openapi-converter
```

### 8. Test Global Installation

```bash
# Install globally
npm install -g bruno-openapi-converter

# Test it
openapi-to-bruno --version
openapi-to-bruno --help
```

## Future Updates

When you make changes and want to publish a new version:

```bash
# For bug fixes (1.0.0 -> 1.0.1)
npm version patch

# For new features (1.0.0 -> 1.1.0)
npm version minor

# For breaking changes (1.0.0 -> 2.0.0)
npm version major

# Push the version tag
git push && git push --tags

# Publish
npm publish
```

## Troubleshooting

**"Package name already exists"**
- The name `bruno-openapi-converter` might be taken
- Try: `@rreyn-bruno/bruno-openapi-converter` (scoped package)
- Update `name` in package.json if needed

**"You must be logged in"**
- Run `npm login` again
- Check with `npm whoami`

**"You do not have permission"**
- Make sure you're logged in with the correct account
- If using a scoped package, add `--access public`

## What's Included in the Package?

Based on the `files` field in package.json:
- ✅ `bin/` - CLI executable
- ✅ `src/` - All source code including vendored packages
- ✅ `README.md` - Documentation
- ✅ `LICENSE` - MIT License
- ✅ `EXAMPLES_SUPPORT.md` - Examples documentation

Excluded (via .npmignore):
- ❌ Test files
- ❌ Development configs
- ❌ Git files
- ❌ IDE files
- ❌ PUBLISHING.md (internal docs)

## After Publishing

1. **Add npm badges to README.md**:
```markdown
[![npm version](https://badge.fury.io/js/bruno-openapi-converter.svg)](https://www.npmjs.com/package/bruno-openapi-converter)
[![npm downloads](https://img.shields.io/npm/dm/bruno-openapi-converter.svg)](https://www.npmjs.com/package/bruno-openapi-converter)
```

2. **Create a GitHub Release**:
- Go to: https://github.com/rreyn-bruno/bruno-openapi-converter/releases
- Click "Create a new release"
- Tag: `v1.0.0`
- Title: `v1.0.0 - Initial Release`
- Description: List the features

3. **Announce**:
- Bruno Discord/Community
- Twitter/X
- Reddit (r/webdev, r/javascript)
- Dev.to blog post

## Need Help?

See the full [PUBLISHING.md](./PUBLISHING.md) guide for detailed information.

