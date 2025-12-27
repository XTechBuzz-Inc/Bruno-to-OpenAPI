# Bruno OpenAPI Converter

Convert OpenAPI specifications to Bruno collection file structure (`.bru` format).

## Features

- ✅ Converts OpenAPI 3.x specifications to Bruno collections
- 📁 Creates complete `.bru` file structure (not just JSON)
- 🌐 Supports URLs, local files, JSON, and YAML
- 📦 Generates folders, requests, environments, and collection metadata
- 🎯 Ready for Git, documentation generation, and Bruno client import

## Why This Tool?

The official `@usebruno/converters` package converts OpenAPI to Bruno's JSON format, but Bruno uses a human-readable `.bru` file format for Git-friendly collections. This tool bridges that gap by:

1. Converting OpenAPI → Bruno JSON (using `@usebruno/converters`)
2. Writing the complete `.bru` file structure (using `@usebruno/filestore`)

This gives you a **Git-ready Bruno collection** that can be:
- Committed to version control
- Imported into Bruno client
- Used to generate documentation
- Shared with your team

## Installation

### Global Installation (Recommended)

```bash
npm install -g bruno-openapi-converter
```

### Local Installation

```bash
npm install bruno-openapi-converter
```

### From Source

```bash
git clone https://github.com/yourusername/bruno-openapi-converter.git
cd bruno-openapi-converter
npm install
npm link
```

## Usage

### Command Line

```bash
# Convert from URL
openapi-to-bruno https://petstore3.swagger.io/api/v3/openapi.json ./petstore

# Convert from local file
openapi-to-bruno ./specs/my-api.yaml ./my-bruno-collection

# Convert with force overwrite
openapi-to-bruno ./openapi.json ./output --force

# Verbose output
openapi-to-bruno ./openapi.json ./output --verbose
```

### Programmatic Usage

```javascript
const { convertOpenApiToFileStructure } = require('bruno-openapi-converter');

async function convert() {
  const result = await convertOpenApiToFileStructure(
    'https://petstore3.swagger.io/api/v3/openapi.json',
    './petstore-collection',
    { verbose: true }
  );
  
  console.log('Conversion complete!', result);
}

convert();
```

## CLI Options

```
Usage: openapi-to-bruno [options] <input> [output]

Arguments:
  input                OpenAPI spec file path or URL (JSON or YAML)
  output               Output directory for Bruno collection (default: "./bruno-collection")

Options:
  -V, --version        output the version number
  -v, --verbose        Enable verbose logging
  -f, --force          Overwrite output directory if it exists
  -h, --help           display help for command
```

## Input Formats

The converter accepts:

- **URLs**: `https://api.example.com/openapi.json`
- **Local JSON files**: `./specs/openapi.json`
- **Local YAML files**: `./specs/openapi.yaml` or `./specs/openapi.yml`
- **JavaScript objects**: Pass an OpenAPI object directly (programmatic usage)

## Output Structure

The converter creates a complete Bruno collection:

```
my-collection/
├── bruno.json              # Collection configuration
├── collection.bru          # Collection-level settings
├── environments/           # Environment variables
│   └── production.bru
├── Pet/                    # Folders for tags/groups
│   ├── folder.bru
│   ├── Add a new pet.bru
│   ├── Update pet.bru
│   └── Find pet by ID.bru
└── User/
    ├── folder.bru
    ├── Create user.bru
    └── Get user.bru
```

## Examples

### Example 1: Petstore API

```bash
openapi-to-bruno \
  https://petstore3.swagger.io/api/v3/openapi.json \
  ./petstore
```

Output:
```
🔄 Converting OpenAPI to Bruno file structure...

📥 Fetching OpenAPI spec from URL: https://petstore3.swagger.io/api/v3/openapi.json
✓ OpenAPI spec loaded: Swagger Petstore - OpenAPI 3.0

🔄 Converting to Bruno format...
✓ Converted to Bruno collection: Swagger Petstore - OpenAPI 3.0

📁 Creating output directory: ./petstore
✓ Output directory ready

📝 Writing collection files...
  ✓ Created bruno.json
  ✓ Created collection.bru
  ✓ Created folder: pet/
  ✓ Created request: Add a new pet to the store.bru
  ✓ Created request: Update an existing pet.bru
  ...

✅ Conversion complete!
📦 Bruno collection created at: ./petstore

📊 Summary:
   Collection: Swagger Petstore - OpenAPI 3.0
   Requests/Folders: 19
   Environments: 1
   Output: ./petstore

💡 Next steps:
   1. Open the collection in Bruno: bruno ./petstore
   2. Generate documentation: bruno-docs generate ./petstore
```

### Example 2: Local YAML File

```bash
openapi-to-bruno ./my-api.yaml ./my-collection --force
```

### Example 3: Programmatic Usage

```javascript
const { convertOpenApiToFileStructure } = require('bruno-openapi-converter');

async function convertMultipleApis() {
  const apis = [
    { url: 'https://api1.com/openapi.json', output: './api1' },
    { url: 'https://api2.com/openapi.json', output: './api2' },
  ];

  for (const api of apis) {
    try {
      await convertOpenApiToFileStructure(api.url, api.output);
      console.log(`✓ Converted ${api.url}`);
    } catch (error) {
      console.error(`✗ Failed to convert ${api.url}:`, error.message);
    }
  }
}

convertMultipleApis();
```

## Use Cases

### 1. API Catalog Service
Convert discovered OpenAPI specs to Bruno collections for a browsable catalog.

### 2. Documentation Generation
Generate static documentation from OpenAPI specs via Bruno collections.

### 3. Team Collaboration
Convert company APIs to Bruno format for version control and team sharing.

### 4. API Testing
Import OpenAPI specs into Bruno for manual or automated testing.

### 5. Migration
Migrate from Swagger/OpenAPI to Bruno for a better developer experience.

## Integration

### With bruno-doc-gen

```bash
# Convert OpenAPI to Bruno
openapi-to-bruno https://api.example.com/openapi.json ./api

# Generate documentation
bruno-docs generate ./api -o ./docs --title "My API"
```

### With bruno-api-catalog

This converter is used by [bruno-api-catalog](https://github.com/yourusername/bruno-api-catalog) to automatically convert discovered OpenAPI specs.

## API Reference

### `convertOpenApiToFileStructure(openApiSpec, outputDir, options)`

Converts an OpenAPI specification to Bruno file structure.

**Parameters:**
- `openApiSpec` (string|object): OpenAPI spec (URL, file path, or object)
- `outputDir` (string): Output directory path
- `options` (object): Optional configuration
  - `verbose` (boolean): Enable verbose logging

**Returns:** Promise<object>
```javascript
{
  success: true,
  collectionName: "My API",
  outputPath: "./my-collection",
  itemCount: 15,
  environmentCount: 1
}
```

### `sanitizeName(name)`

Sanitizes a name for safe file system usage.

**Parameters:**
- `name` (string): Name to sanitize

**Returns:** string

## Requirements

- Node.js >= 18.0.0
- `@usebruno/converters` - OpenAPI to Bruno JSON conversion
- `@usebruno/filestore` - Bruno file format utilities

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT

## Credits

Built for the [Bruno](https://www.usebruno.com/) API client community.

Uses:
- [@usebruno/converters](https://www.npmjs.com/package/@usebruno/converters) - OpenAPI to Bruno conversion
- [@usebruno/filestore](https://www.npmjs.com/package/@usebruno/filestore) - Bruno file format utilities

## Related Projects

- [Bruno](https://github.com/usebruno/bruno) - Fast and Git-friendly API client
- [bruno-doc-gen](https://github.com/yourusername/bruno-doc-gen) - Generate documentation from Bruno collections
- [bruno-api-catalog](https://github.com/yourusername/bruno-api-catalog) - Automated API catalog service

## Support

- 🐛 [Report bugs](https://github.com/yourusername/bruno-openapi-converter/issues)
- 💡 [Request features](https://github.com/yourusername/bruno-openapi-converter/issues)
- 📖 [Documentation](https://github.com/yourusername/bruno-openapi-converter)
