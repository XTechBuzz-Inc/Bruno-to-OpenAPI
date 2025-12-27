// Use enhanced converter with improved example extraction
const { openApiToBruno } = require('./enhanced-converters/cjs/index.js');
const { stringifyRequest: vendoredStringifyRequest } = require('./vendored-filestore');
const { stringifyCollection, stringifyFolder } = require('@usebruno/filestore');
const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const parseBru = require('./vendored-bruno-lang/v2/src/bruToJson');
const parseEnv = require('./vendored-bruno-lang/v2/src/envToJson');

/**
 * Sanitize a name to be safe for file system usage
 * @param {string} name - The name to sanitize
 * @returns {string} - Sanitized name
 */
function sanitizeName(name) {
  if (!name) return 'unnamed';
  // Replace invalid file system characters with hyphens
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Recursively write collection items (folders and requests) to file system
 * @param {Array} items - Array of collection items
 * @param {string} currentPath - Current directory path
 */
async function writeItems(items, currentPath) {
  if (!items || !Array.isArray(items)) {
    return;
  }

  for (const item of items) {
    try {
      if (item.type === 'http-request' || item.type === 'graphql-request' || item.type === 'grpc-request') {
        // Write request file
        const filename = sanitizeName(`${item.name}.bru`);
        const filePath = path.join(currentPath, filename);
        const content = vendoredStringifyRequest(item);
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`  ✓ Created request: ${filename}`);
      } else if (item.type === 'folder') {
        // Create folder directory
        const folderName = sanitizeName(item.name);
        const folderPath = path.join(currentPath, folderName);
        await fs.ensureDir(folderPath);
        console.log(`  ✓ Created folder: ${folderName}/`);

        // Write folder.bru if folder has root metadata
        if (item.root) {
          const folderBruPath = path.join(folderPath, 'folder.bru');
          const folderContent = stringifyFolder(item.root);
          await fs.writeFile(folderBruPath, folderContent, 'utf8');
        }

        // Recursively write folder items
        if (item.items && item.items.length > 0) {
          await writeItems(item.items, folderPath);
        }
      }
    } catch (error) {
      console.error(`  ✗ Error processing item "${item.name}":`, error.message);
    }
  }
}

/**
 * Convert OpenAPI specification to Bruno file structure
 * @param {string|Object} openApiSpec - OpenAPI spec (file path, URL, or object)
 * @param {string} outputDir - Output directory for Bruno collection
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Conversion result
 */
async function convertOpenApiToFileStructure(openApiSpec, outputDir, options = {}) {
  try {
    console.log('🔄 Converting OpenAPI to Bruno file structure...\n');

    // Step 1: Load OpenAPI spec
    let openApiData;
    if (typeof openApiSpec === 'string') {
      if (openApiSpec.startsWith('http://') || openApiSpec.startsWith('https://')) {
        // Load from URL
        console.log(`📥 Fetching OpenAPI spec from URL: ${openApiSpec}`);
        const response = await fetch(openApiSpec);
        const contentType = response.headers.get('content-type');
        const text = await response.text();
        
        if (contentType && contentType.includes('yaml')) {
          openApiData = yaml.load(text);
        } else {
          openApiData = JSON.parse(text);
        }
      } else {
        // Load from file
        console.log(`📂 Loading OpenAPI spec from file: ${openApiSpec}`);
        const fileContent = await fs.readFile(openApiSpec, 'utf8');
        const ext = path.extname(openApiSpec).toLowerCase();
        
        if (ext === '.yaml' || ext === '.yml') {
          openApiData = yaml.load(fileContent);
        } else {
          openApiData = JSON.parse(fileContent);
        }
      }
    } else {
      // Already an object
      openApiData = openApiSpec;
    }

    console.log(`✓ OpenAPI spec loaded: ${openApiData.info?.title || 'Untitled'}\n`);

    // Step 2: Convert OpenAPI to Bruno JSON format
    console.log('🔄 Converting to Bruno format...');
    const brunoJson = openApiToBruno(openApiData, { groupBy: 'path' });
    console.log(`✓ Converted to Bruno collection: ${brunoJson.name}\n`);

    // Step 3: Create output directory
    console.log(`📁 Creating output directory: ${outputDir}`);
    await fs.ensureDir(outputDir);
    console.log('✓ Output directory ready\n');

    // Step 4: Write bruno.json config file
    console.log('📝 Writing collection files...');
    const brunoConfig = {
      version: "1",
      name: brunoJson.name,
      type: "collection",
      ignore: ["node_modules", ".git"]
    };
    
    const brunoConfigPath = path.join(outputDir, 'bruno.json');
    await fs.writeFile(brunoConfigPath, JSON.stringify(brunoConfig, null, 2), 'utf8');
    console.log('  ✓ Created bruno.json');

    // Step 5: Write collection.bru file
    const collectionRoot = brunoJson.root || {
      request: {
        headers: [],
        auth: { mode: 'inherit' },
        script: {},
        vars: {},
        tests: ''
      },
      docs: openApiData.info?.description || ''
    };
    
    const collectionContent = stringifyCollection(collectionRoot);
    const collectionBruPath = path.join(outputDir, 'collection.bru');
    await fs.writeFile(collectionBruPath, collectionContent, 'utf8');
    console.log('  ✓ Created collection.bru');

    // Step 6: Write environments if they exist
    if (brunoJson.environments && brunoJson.environments.length > 0) {
      const environmentsDir = path.join(outputDir, 'environments');
      await fs.ensureDir(environmentsDir);
      
      for (const env of brunoJson.environments) {
        const envFileName = sanitizeName(`${env.name}.bru`);
        const envFilePath = path.join(environmentsDir, envFileName);
        
        // Create environment file content
        let envContent = `vars {\n`;
        if (env.variables && env.variables.length > 0) {
          for (const variable of env.variables) {
            const prefix = variable.enabled === false ? '~' : '';
            envContent += `  ${prefix}${variable.name}: ${variable.value}\n`;
          }
        }
        envContent += `}\n`;
        
        await fs.writeFile(envFilePath, envContent, 'utf8');
        console.log(`  ✓ Created environment: ${envFileName}`);
      }
    }

    // Step 7: Write all requests and folders
    if (brunoJson.items && brunoJson.items.length > 0) {
      await writeItems(brunoJson.items, outputDir);
    }

    console.log('\n✅ Conversion complete!');
    console.log(`📦 Bruno collection created at: ${outputDir}`);
    
    return {
      success: true,
      collectionName: brunoJson.name,
      outputPath: outputDir,
      itemCount: brunoJson.items?.length || 0,
      environmentCount: brunoJson.environments?.length || 0
    };

  } catch (error) {
    console.error('\n❌ Conversion failed:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    throw error;
  }
}

/**
 * Infer JSON schema from object
 */
function inferSchema(obj) {
  if (obj === null) return { type: 'null' };
  if (Array.isArray(obj)) {
    return { type: 'array', items: obj.length > 0 ? inferSchema(obj[0]) : {} };
  }
  if (typeof obj === 'object') {
    const properties = {};
    const required = [];
    for (const [key, value] of Object.entries(obj)) {
      properties[key] = inferSchema(value);
      if (value !== null && value !== undefined) required.push(key);
    }
    return { type: 'object', properties, required: required.length > 0 ? required : undefined };
  }
  return { type: typeof obj };
}

/**
 * Convert Bruno collection to OpenAPI JSON
 */
async function convertBrunoToOpenApi(brunoDir, outputFile, options = {}) {
  const brunoConfig = await fs.readJson(path.join(brunoDir, 'bruno.json'));
  const items = [];
  
  async function readDir(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'environments') {
        await readDir(fullPath);
      } else if (entry.name.endsWith('.bru') && !['collection.bru', 'folder.bru'].includes(entry.name)) {
        try {
          const parsed = parseBru(await fs.readFile(fullPath, 'utf8'));
          if ((parsed.meta?.type === 'http' || parsed.meta?.type === 'http-request') && parsed.http) {
            items.push({
              name: parsed.meta.name,
              method: parsed.http.method?.toLowerCase(),
              url: parsed.http.url?.replace(/\{\{([^}]+)\}\}/g, ''),
              pathParams: parsed.params?.filter(p => p.type === 'path') || [],
              queryParams: parsed.params?.filter(p => p.type === 'query') || [],
              body: parsed.body,
              docs: parsed.docs || ''
            });
          }
        } catch (e) {}
      }
    }
  }
  
  await readDir(brunoDir);
  
  let baseUrl = 'http://localhost:3000';
  try {
    const envDir = path.join(brunoDir, 'environments');
    if (await fs.pathExists(envDir)) {
      // Prefer Local environment first, then production, then others
      const envFiles = (await fs.readdir(envDir)).sort((a, b) => {
        const aLocal = a.toLowerCase().includes('local');
        const bLocal = b.toLowerCase().includes('local');
        const aProd = a.toLowerCase().includes('production');
        const bProd = b.toLowerCase().includes('production');
        if (aLocal && !bLocal) return -1;
        if (!aLocal && bLocal) return 1;
        if (aProd && !bProd) return -1;
        if (!aProd && bProd) return 1;
        return a.localeCompare(b);
      });
      
      for (const file of envFiles) {
        if (file.endsWith('.bru')) {
          try {
            const env = parseEnv(await fs.readFile(path.join(envDir, file), 'utf8'));
            const baseUrlVar = env.variables?.find(v => v.name === 'baseUrl');
            const apiUrlVar = env.variables?.find(v => v.name === 'apiUrl');
            
            if (apiUrlVar && baseUrlVar) {
              // Resolve {{baseUrl}} template in apiUrl
              baseUrl = apiUrlVar.value.replace(/\{\{baseUrl\}\}/g, baseUrlVar.value);
              break;
            } else if (baseUrlVar) {
              baseUrl = baseUrlVar.value;
              break;
            }
          } catch (e) {}
        }
      }
    }
  } catch (e) {}
  
  const paths = {};
  const components = { schemas: {} };
  let schemaCounter = 0;
  
  items.forEach(item => {
    // Remove baseUrl and apiUrl from the path, keep only the endpoint path
    let pathPattern = item.url.replace(baseUrl, '').replace(/^\/+/, '/');
    // If apiUrl contains /api, ensure path starts with /api
    if (baseUrl.includes('/api') && !pathPattern.startsWith('/api')) {
      pathPattern = '/api' + pathPattern;
    }
    pathPattern = pathPattern.replace(/:([^/]+)/g, '{$1}');
    const params = [
      ...item.pathParams.map(p => ({ name: p.name, in: 'path', required: true, schema: { type: 'string' } })),
      ...item.queryParams.map(p => ({ name: p.name, in: 'query', required: false, schema: { type: 'string' } }))
    ];
    
    const operation = {
      summary: item.name,
      description: item.docs,
      operationId: sanitizeName(item.name).replace(/\s+/g, '_').toLowerCase(),
      parameters: params,
      responses: { '200': { description: 'Success' } }
    };
    
    if (item.body?.json) {
      try {
        const jsonBody = typeof item.body.json === 'string' ? JSON.parse(item.body.json) : item.body.json;
        const schema = inferSchema(jsonBody);
        const schemaName = `RequestBody${++schemaCounter}`;
        components.schemas[schemaName] = schema;
        operation.requestBody = {
          required: true,
          content: { 'application/json': { schema: { $ref: `#/components/schemas/${schemaName}` }, example: jsonBody } }
        };
      } catch (e) {}
    }
    
    if (!paths[pathPattern]) paths[pathPattern] = {};
    paths[pathPattern][item.method] = operation;
  });
  
  // Extract base URL without /api for servers, keep /api in paths if needed
  let serverUrl = baseUrl;
  if (baseUrl.includes('/api')) {
    serverUrl = baseUrl.replace('/api', '');
  }
  
  const openApi = {
    openapi: '3.0.0',
    info: { title: brunoConfig.name || 'API', version: '1.0.0' },
    servers: [{ url: serverUrl }],
    paths,
    components: Object.keys(components.schemas).length > 0 ? components : undefined
  };
  
  await fs.writeFile(outputFile, JSON.stringify(openApi, null, 2), 'utf8');
  
  return {
    success: true,
    collectionName: brunoConfig.name || 'API',
    outputPath: outputFile,
    pathCount: Object.keys(paths).length,
    operationCount: Object.values(paths).reduce((sum, p) => sum + Object.keys(p).length, 0),
    tagCount: 0
  };
}

module.exports = {
  convertOpenApiToFileStructure,
  convertBrunoToOpenApi,
  sanitizeName
};

