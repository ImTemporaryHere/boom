const config = {
  schemaFile: 'http://localhost:3000/api/docs-json',
  apiFile: './src/store/api/baseApi.ts',
  apiImport: 'baseApi',
  outputFile: './src/store/api/generatedApi.ts',
  exportName: 'api',
  hooks: true,
  tag: true,
};

module.exports = config;
