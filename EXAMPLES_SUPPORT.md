# Examples Support in Bruno OpenAPI Converter

## Overview

This converter now fully supports extracting and converting request/response examples from OpenAPI specifications into Bruno's `.bru` file format.

## What Was Fixed

### Problem
The converter was using the enhanced OpenAPI converter that extracts examples from OpenAPI specs, but the examples were not being written to the generated `.bru` files.

### Root Cause
The published npm package `@usebruno/lang` (version 0.27.0) did not include support for the `example` blocks in the `.bru` file format. This feature exists in the main Bruno repository but hasn't been published to npm yet.

### Solution
Vendored the `bruno-lang/v2` source code from the main Bruno repository and created a custom `stringifyRequest` function that uses the vendored version with example support.

## Implementation Details

### Files Added
1. **`src/vendored-bruno-lang/v2/`** - Complete vendored copy of bruno-lang v2 with example support
2. **`src/vendored-filestore.js`** - Custom wrapper that uses the vendored bruno-lang to stringify requests with examples

### Files Modified
1. **`src/index.js`** - Updated to use the vendored `stringifyRequest` function instead of the npm package version

## Features

### Example Extraction
The converter now extracts examples from multiple sources in OpenAPI specs:
- `schema.example` - Single example at schema level
- `content.example` - Single example at content level  
- `content.examples` - Multiple named examples
- Property-level examples - Examples on individual properties
- Array item examples
- Nested object examples

### Example Output Format
Examples are written to `.bru` files in the following format:

```bru
example {
  name: 200 Response
  
  request: {
    url: {{baseUrl}}/v4/domains
    method: GET
    mode: none
    params:query: {
      ~teamId: 
    }
  }
  
  response: {
    headers: {
      Content-Type: application/json
    }
  
    status: {
      code: 200
      text: OK
    }
  
    body: {
      type: json
      content: '''
        {
          "domains": [
            {
              "id": "Qmf2RSrNz5sqt6nznp4JpAyXgT6pY65qwJJn8gESt2iKoi",
              "name": "zeit.rocks",
              ...
            }
          ]
        }
      '''
    }
  }
}
```

### Multiple Examples
If an OpenAPI operation has multiple response examples (e.g., 200, 404, 500), each will be converted to a separate `example` block in the `.bru` file.

## Path-Based Grouping

The converter also uses path-based grouping (instead of tag-based) to organize requests by their URL path structure:

```
v1/
  integrations/
    webhooks/
      Get a list of existent webhooks.bru
      Create a new webhook.bru
      -id/
        Remove a webhook by id.bru
v4/
  domains/
    Gets a list of domains registered for the authenticating user.bru
    {name}/
      Get a domain for the authenticated user by name.bru
```

This is configured by passing `{ groupBy: 'path' }` to the `openApiToBruno` function.

## Usage

Simply run the converter as before:

```bash
node bin/openapi-to-bruno <openapi-file> <output-directory>
```

Examples will be automatically extracted and included in the generated `.bru` files.

## Benefits

1. **Complete API Documentation** - Examples provide clear documentation of expected request/response formats
2. **Ready-to-Use Requests** - Examples can be used directly in Bruno to test APIs
3. **Multiple Scenarios** - Different response codes (200, 404, 500, etc.) are captured as separate examples
4. **Maintains OpenAPI Fidelity** - All examples from the OpenAPI spec are preserved in the Bruno collection

## Future Improvements

When the Bruno team publishes a new version of `@usebruno/lang` with example support to npm, the vendored code can be removed and the converter can use the published package instead.

