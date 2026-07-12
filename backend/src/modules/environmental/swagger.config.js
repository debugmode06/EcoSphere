/**
 * @fileoverview Swagger configuration for the Environmental Module
 */
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EcoSphere – Environmental Module API',
      version: '1.0.0',
      description: 'Complete REST API documentation for the EcoSphere Environmental Module. ' +
                   'Covers Emission Factors, Carbon Transactions, Dashboard, Environmental Goals, ' +
                   'Product ESG Profiles, Analytics, Reports, and Search & Filters.',
      contact: { name: 'EcoSphere Team' }
    },
    servers: [{ url: 'http://localhost:5000', description: 'Local Development Server' }],
    tags: [
      { name: 'Emission Factors',        description: 'Manage emission factor reference data' },
      { name: 'Carbon Transactions',     description: 'Log and manage carbon transactions' },
      { name: 'Dashboard',               description: 'Dashboard summary and analytics cards' },
      { name: 'Environmental Goals',     description: 'CRUD and progress tracking for ESG goals' },
      { name: 'Product ESG Profiles',   description: 'Manage product-level ESG data' },
      { name: 'Analytics',              description: 'MongoDB Aggregation-powered analytics' },
      { name: 'Reports',                description: 'Exportable reports in JSON, CSV, PDF' },
      { name: 'Search & Filters',       description: 'Advanced filtering and full-text search' }
    ],
    components: {
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data:    { type: 'object' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error:   { type: 'string' }
          }
        },
        EmissionFactor: {
          type: 'object',
          required: ['factor_id', 'activity_name', 'category', 'unit', 'emission_factor'],
          properties: {
            factor_id:       { type: 'string', example: 'EF001' },
            activity_name:   { type: 'string', example: 'Electricity Consumption' },
            category:        { type: 'string', example: 'Energy' },
            unit:            { type: 'string', example: 'kWh' },
            emission_factor: { type: 'number', example: 0.233 },
            factor_unit:     { type: 'string', example: 'kg CO2e / kWh' },
            source:          { type: 'string', example: 'IEA 2023' },
            year:            { type: 'number', example: 2023 },
            is_active:       { type: 'boolean', example: true }
          }
        },
        CarbonTransaction: {
          type: 'object',
          required: ['emissionFactor', 'quantity'],
          properties: {
            emissionFactor:  { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
            quantity:        { type: 'number', example: 500 },
            carbonEmission:  { type: 'number', example: 116.5 },
            department:      { type: 'string', example: 'Manufacturing' },
            description:     { type: 'string', example: 'Monthly electricity usage' },
            transactionDate: { type: 'string', format: 'date-time' },
            status:          { type: 'string', enum: ['active', 'inactive'], example: 'active' }
          }
        },
        EnvironmentalGoal: {
          type: 'object',
          required: ['goal_id', 'goal_name', 'department_id', 'baseline_emission_kg_co2e', 'target_emission_kg_co2e', 'start_date', 'end_date'],
          properties: {
            goal_id:                   { type: 'string', example: 'GOAL001' },
            goal_name:                 { type: 'string', example: 'Reduce Manufacturing Emissions 20%' },
            goal_type:                 { type: 'string', enum: ['REDUCTION', 'EFFICIENCY', 'RENEWABLE', 'WASTE', 'OTHER'], example: 'REDUCTION' },
            department_id:             { type: 'string', example: 'DEPT001' },
            target_reduction:          { type: 'number', example: 20 },
            baseline_emission_kg_co2e: { type: 'number', example: 10000 },
            target_emission_kg_co2e:   { type: 'number', example: 8000 },
            start_date:                { type: 'string', format: 'date', example: '2024-01-01' },
            end_date:                  { type: 'string', format: 'date', example: '2024-12-31' },
            status:                    { type: 'string', enum: ['ACTIVE', 'ACHIEVED', 'NOT_ACHIEVED'], example: 'ACTIVE' }
          }
        },
        ProductESGProfile: {
          type: 'object',
          required: ['product_id', 'product_name', 'category'],
          properties: {
            product_id:           { type: 'string', example: 'PROD001' },
            product_name:         { type: 'string', example: 'Eco Widget Pro' },
            category:             { type: 'string', example: 'Electronics' },
            material:             { type: 'string', example: 'Recycled Plastic' },
            supplier:             { type: 'string', example: 'GreenSupply Co' },
            carbon_footprint:     { type: 'number', example: 12.5 },
            water_consumption:    { type: 'number', example: 45.0 },
            energy_consumption:   { type: 'number', example: 200.0 },
            recyclable_percentage:{ type: 'number', example: 75.0 },
            lifecycle_score:      { type: 'number', example: 82.0 }
          }
        }
      }
    },
    paths: {
      // ── EMISSION FACTORS ──────────────────────────────────────────────────
      '/api/environmental/emission-factors': {
        get: {
          tags: ['Emission Factors'], summary: 'Get all emission factors',
          responses: { 200: { description: 'List of active emission factors' } }
        },
        post: {
          tags: ['Emission Factors'], summary: 'Create emission factor',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/EmissionFactor' } } } },
          responses: { 201: { description: 'Emission factor created' }, 400: { description: 'Validation error' } }
        }
      },
      '/api/environmental/emission-factors/{factorId}': {
        get:    { tags: ['Emission Factors'], summary: 'Get one emission factor', parameters: [{ name: 'factorId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Factor found' }, 404: { description: 'Not found' } } },
        put:    { tags: ['Emission Factors'], summary: 'Update emission factor', parameters: [{ name: 'factorId', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/EmissionFactor' } } } }, responses: { 200: { description: 'Updated' } } },
        delete: { tags: ['Emission Factors'], summary: 'Soft-delete emission factor', parameters: [{ name: 'factorId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deactivated' } } }
      },
      // ── CARBON TRANSACTIONS ───────────────────────────────────────────────
      '/api/environmental/carbon-transactions': {
        get:  { tags: ['Carbon Transactions'], summary: 'List all carbon transactions', parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }, { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }, { name: 'sortBy', in: 'query', schema: { type: 'string', example: 'transactionDate:desc' } }], responses: { 200: { description: 'Paginated list' } } },
        post: { tags: ['Carbon Transactions'], summary: 'Create carbon transaction (auto-calculates emission)', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CarbonTransaction' } } } }, responses: { 201: { description: 'Created with carbonEmission calculated' } } }
      },
      '/api/environmental/carbon-transactions/{id}': {
        get:    { tags: ['Carbon Transactions'], summary: 'Get one transaction', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Found' }, 404: { description: 'Not found' } } },
        put:    { tags: ['Carbon Transactions'], summary: 'Update transaction', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CarbonTransaction' } } } }, responses: { 200: { description: 'Updated' } } },
        delete: { tags: ['Carbon Transactions'], summary: 'Soft-delete transaction', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Soft-deleted' } } }
      },
      // ── DASHBOARD ─────────────────────────────────────────────────────────
      '/api/environmental/dashboard/summary':              { get: { tags: ['Dashboard'], summary: 'Overall dashboard summary', responses: { 200: { description: 'Totals and counts' } } } },
      '/api/environmental/dashboard/monthly-emissions':    { get: { tags: ['Dashboard'], summary: 'Monthly emission trend', responses: { 200: { description: 'Emissions per month' } } } },
      '/api/environmental/dashboard/department-emissions': { get: { tags: ['Dashboard'], summary: 'Emissions grouped by department', responses: { 200: { description: 'Sorted by total emission desc' } } } },
      '/api/environmental/dashboard/category-emissions':   { get: { tags: ['Dashboard'], summary: 'Emissions grouped by category (via EmissionFactor join)', responses: { 200: { description: 'Category totals' } } } },
      '/api/environmental/dashboard/recent-transactions':  { get: { tags: ['Dashboard'], summary: 'Latest 10 transactions', parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }], responses: { 200: { description: 'Recent records' } } } },
      '/api/environmental/dashboard/top-departments':      { get: { tags: ['Dashboard'], summary: 'Top 5 polluting departments', responses: { 200: { description: 'Top 5 list' } } } },
      '/api/environmental/dashboard/cards':                { get: { tags: ['Dashboard'], summary: 'All KPI card values in one call', responses: { 200: { description: 'Card metrics' } } } },
      // ── GOALS ─────────────────────────────────────────────────────────────
      '/api/environmental/goals/progress': { get: { tags: ['Environmental Goals'], summary: 'Progress report for all active goals', responses: { 200: { description: 'Achievement % per goal' } } } },
      '/api/environmental/goals': {
        get:  { tags: ['Environmental Goals'], summary: 'List all goals', parameters: [{ name: 'status', in: 'query', schema: { type: 'string' } }, { name: 'department_id', in: 'query', schema: { type: 'string' } }, { name: 'search', in: 'query', schema: { type: 'string' } }, { name: 'page', in: 'query', schema: { type: 'integer' } }, { name: 'limit', in: 'query', schema: { type: 'integer' } }], responses: { 200: { description: 'Paginated goals' } } },
        post: { tags: ['Environmental Goals'], summary: 'Create goal', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/EnvironmentalGoal' } } } }, responses: { 201: { description: 'Created' }, 409: { description: 'Duplicate goal_id' } } }
      },
      '/api/environmental/goals/{id}': {
        get:    { tags: ['Environmental Goals'], summary: 'Get one goal', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Found' } } },
        put:    { tags: ['Environmental Goals'], summary: 'Update goal', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/EnvironmentalGoal' } } } }, responses: { 200: { description: 'Updated' } } },
        delete: { tags: ['Environmental Goals'], summary: 'Soft-delete goal (sets status=NOT_ACHIEVED)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Soft-deleted' } } }
      },
      // ── PRODUCTS ──────────────────────────────────────────────────────────
      '/api/environmental/products': {
        get:  { tags: ['Product ESG Profiles'], summary: 'List products', parameters: [{ name: 'category', in: 'query', schema: { type: 'string' } }, { name: 'supplier', in: 'query', schema: { type: 'string' } }, { name: 'search', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Paginated products' } } },
        post: { tags: ['Product ESG Profiles'], summary: 'Create product ESG profile', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductESGProfile' } } } }, responses: { 201: { description: 'Created' }, 409: { description: 'Duplicate product_id' } } }
      },
      '/api/environmental/products/{id}': {
        get:    { tags: ['Product ESG Profiles'], summary: 'Get product by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Found' } } },
        put:    { tags: ['Product ESG Profiles'], summary: 'Update product', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductESGProfile' } } } }, responses: { 200: { description: 'Updated' } } },
        delete: { tags: ['Product ESG Profiles'], summary: 'Soft-delete product', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Soft-deleted' } } }
      },
      // ── ANALYTICS ─────────────────────────────────────────────────────────
      '/api/environmental/analytics/monthly':         { get: { tags: ['Analytics'], summary: 'Monthly emission trend', responses: { 200: { description: 'Data by month' } } } },
      '/api/environmental/analytics/yearly':          { get: { tags: ['Analytics'], summary: 'Yearly emission trend', responses: { 200: { description: 'Data by year' } } } },
      '/api/environmental/analytics/departments':     { get: { tags: ['Analytics'], summary: 'Emissions by department', responses: { 200: { description: 'Department totals' } } } },
      '/api/environmental/analytics/categories':      { get: { tags: ['Analytics'], summary: 'Emissions by category', responses: { 200: { description: 'Category totals' } } } },
      '/api/environmental/analytics/highest-month':   { get: { tags: ['Analytics'], summary: 'Month with highest total emission', responses: { 200: { description: 'Single record' } } } },
      '/api/environmental/analytics/lowest-month':    { get: { tags: ['Analytics'], summary: 'Month with lowest total emission', responses: { 200: { description: 'Single record' } } } },
      '/api/environmental/analytics/average-monthly': { get: { tags: ['Analytics'], summary: 'Average monthly emission', responses: { 200: { description: 'Average value' } } } },
      '/api/environmental/analytics/kpi':             { get: { tags: ['Analytics'], summary: 'Environmental KPIs dashboard', responses: { 200: { description: 'KPI object' } } } },
      // ── REPORTS ───────────────────────────────────────────────────────────
      '/api/environmental/reports/carbon':      { get: { tags: ['Reports'], summary: 'Carbon report', parameters: [{ name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv', 'pdf'], default: 'json' } }], responses: { 200: { description: 'Report data or file download' } } } },
      '/api/environmental/reports/monthly':     { get: { tags: ['Reports'], summary: 'Monthly report', parameters: [{ name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv', 'pdf'] } }], responses: { 200: { description: 'Monthly summary' } } } },
      '/api/environmental/reports/department':  { get: { tags: ['Reports'], summary: 'Department report', parameters: [{ name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv', 'pdf'] } }], responses: { 200: { description: 'Department totals' } } } },
      '/api/environmental/reports/goals':       { get: { tags: ['Reports'], summary: 'Goals report', parameters: [{ name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv', 'pdf'] } }], responses: { 200: { description: 'All goals data' } } } },
      '/api/environmental/reports/esg-summary': { get: { tags: ['Reports'], summary: 'ESG summary report', parameters: [{ name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv', 'pdf'] } }], responses: { 200: { description: 'ESG summary metrics' } } } },
      // ── SEARCH ────────────────────────────────────────────────────────────
      '/api/environmental/search': {
        get: {
          tags: ['Search & Filters'], summary: 'Search and filter transactions',
          parameters: [
            { name: 'department', in: 'query', schema: { type: 'string' } },
            { name: 'category',   in: 'query', schema: { type: 'string' } },
            { name: 'keyword',    in: 'query', schema: { type: 'string' } },
            { name: 'month',      in: 'query', schema: { type: 'integer' } },
            { name: 'year',       in: 'query', schema: { type: 'integer' } },
            { name: 'startDate',  in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'endDate',    in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'page',       in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit',      in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'sortBy',     in: 'query', schema: { type: 'string', example: 'transactionDate:desc' } }
          ],
          responses: { 200: { description: 'Filtered, paginated transaction list' } }
        }
      }
    }
  },
  apis: []
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
