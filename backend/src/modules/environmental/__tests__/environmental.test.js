/**
 * Environmental Module — Automated Tests
 * Run: npx jest src/modules/environmental/__tests__/environmental.test.js --detectOpenHandles
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app');

// ── helpers ────────────────────────────────────────────────────────────────
const BASE = '/api/environmental';

// Track created IDs for cleanup
let factorId  = null;
let txId      = null;
let goalDbId  = null;
let productId = null;

// ──────────────────────────────────────────────────────────────────────────
// EMISSION FACTORS
// ──────────────────────────────────────────────────────────────────────────
describe('Emission Factor API', () => {
  const factor = {
    factor_id:       `TEST_EF_${Date.now()}`,
    activity_name:   'Test Activity',
    category:        'Energy',
    unit:            'kWh',
    emission_factor:  0.5,
    factor_unit:     'kg CO2e/kWh'
  };

  test('POST /emission-factors — creates factor', async () => {
    const res = await request(app).post(`${BASE}/emission-factors`).send(factor);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.factor_id).toBe(factor.factor_id);
    factorId = res.body.data._id;
  });

  test('GET /emission-factors — returns list', async () => {
    const res = await request(app).get(`${BASE}/emission-factors`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /emission-factors/:factorId — returns one', async () => {
    const res = await request(app).get(`${BASE}/emission-factors/${factor.factor_id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.factor_id).toBe(factor.factor_id);
  });

  test('PUT /emission-factors/:factorId — updates factor', async () => {
    const res = await request(app).put(`${BASE}/emission-factors/${factor.factor_id}`).send({ emission_factor: 0.9 });
    expect(res.status).toBe(200);
    expect(res.body.data.emission_factor).toBe(0.9);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// CARBON TRANSACTIONS
// ──────────────────────────────────────────────────────────────────────────
describe('Carbon Transaction API', () => {
  test('POST /carbon-transactions — rejects missing fields', async () => {
    const res = await request(app).post(`${BASE}/carbon-transactions`).send({ department: 'HR' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /carbon-transactions — rejects invalid ObjectId', async () => {
    const res = await request(app).post(`${BASE}/carbon-transactions`).send({ emissionFactor: 'badid', quantity: 100 });
    expect(res.status).toBe(400);
  });

  test('POST /carbon-transactions — creates with valid factor', async () => {
    // factorId must be set from the emission factor test
    if (!factorId) return;
    const res = await request(app).post(`${BASE}/carbon-transactions`).send({
      emissionFactor: factorId, quantity: 100, department: 'TestDept', description: 'Jest test tx'
    });
    expect(res.status).toBe(201);
    expect(res.body.data.carbonEmission).toBeCloseTo(90); // 100 × 0.9
    txId = res.body.data._id;
  });

  test('GET /carbon-transactions — paginated list', async () => {
    const res = await request(app).get(`${BASE}/carbon-transactions?page=1&limit=5`);
    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeDefined();
  });

  test('GET /carbon-transactions/:id — single record', async () => {
    if (!txId) return;
    const res = await request(app).get(`${BASE}/carbon-transactions/${txId}`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(txId);
  });

  test('DELETE /carbon-transactions/:id — soft delete', async () => {
    if (!txId) return;
    const res = await request(app).delete(`${BASE}/carbon-transactions/${txId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('inactive');
  });
});

// ──────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ──────────────────────────────────────────────────────────────────────────
describe('Dashboard APIs', () => {
  const endpoints = [
    'summary', 'monthly-emissions', 'department-emissions',
    'category-emissions', 'recent-transactions', 'top-departments', 'cards'
  ];
  endpoints.forEach(ep => {
    test(`GET /dashboard/${ep}`, async () => {
      const res = await request(app).get(`${BASE}/dashboard/${ep}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

// ──────────────────────────────────────────────────────────────────────────
// ENVIRONMENTAL GOALS
// ──────────────────────────────────────────────────────────────────────────
describe('Environmental Goals API', () => {
  const goal = {
    goal_id:                   `GOAL_${Date.now()}`,
    goal_name:                 'Reduce Emissions 20%',
    department_id:             'DEPT001',
    baseline_emission_kg_co2e:  10000,
    target_emission_kg_co2e:    8000,
    start_date:                '2024-01-01',
    end_date:                  '2024-12-31'
  };

  test('POST /goals — rejects missing fields', async () => {
    const res = await request(app).post(`${BASE}/goals`).send({ goal_id: 'X' });
    expect(res.status).toBe(400);
  });

  test('POST /goals — creates goal', async () => {
    const res = await request(app).post(`${BASE}/goals`).send(goal);
    expect(res.status).toBe(201);
    expect(res.body.data.goal_id).toBe(goal.goal_id);
    goalDbId = res.body.data._id;
  });

  test('POST /goals — rejects duplicate goal_id', async () => {
    const res = await request(app).post(`${BASE}/goals`).send(goal);
    expect(res.status).toBe(409);
  });

  test('GET /goals — returns paginated list', async () => {
    const res = await request(app).get(`${BASE}/goals`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /goals/:id — single goal', async () => {
    if (!goalDbId) return;
    const res = await request(app).get(`${BASE}/goals/${goalDbId}`);
    expect(res.status).toBe(200);
  });

  test('GET /goals/progress — returns progress data', async () => {
    const res = await request(app).get(`${BASE}/goals/progress`);
    expect(res.status).toBe(200);
    expect(res.body.summary).toBeDefined();
  });

  test('PUT /goals/:id — updates goal', async () => {
    if (!goalDbId) return;
    const res = await request(app).put(`${BASE}/goals/${goalDbId}`).send({ status: 'ACHIEVED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACHIEVED');
  });

  test('DELETE /goals/:id — soft delete', async () => {
    if (!goalDbId) return;
    const res = await request(app).delete(`${BASE}/goals/${goalDbId}`);
    expect(res.status).toBe(200);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// PRODUCT ESG PROFILES
// ──────────────────────────────────────────────────────────────────────────
describe('Product ESG Profile API', () => {
  const product = {
    product_id:            `PROD_${Date.now()}`,
    product_name:          'Jest Product',
    category:              'Electronics',
    material:              'Recycled Plastic',
    supplier:              'GreenCo',
    carbon_footprint:       12.5,
    water_consumption:      45,
    energy_consumption:    200,
    recyclable_percentage:  75,
    lifecycle_score:        82
  };

  test('POST /products — rejects missing fields', async () => {
    const res = await request(app).post(`${BASE}/products`).send({ product_id: 'X' });
    expect(res.status).toBe(400);
  });

  test('POST /products — creates product', async () => {
    const res = await request(app).post(`${BASE}/products`).send(product);
    expect(res.status).toBe(201);
    expect(res.body.data.product_name).toBe(product.product_name);
    productId = res.body.data._id;
  });

  test('POST /products — rejects duplicate product_id', async () => {
    const res = await request(app).post(`${BASE}/products`).send(product);
    expect(res.status).toBe(409);
  });

  test('GET /products — paginated list', async () => {
    const res = await request(app).get(`${BASE}/products`);
    expect(res.status).toBe(200);
  });

  test('GET /products/:id — single product', async () => {
    if (!productId) return;
    const res = await request(app).get(`${BASE}/products/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(productId);
  });

  test('PUT /products/:id — updates product', async () => {
    if (!productId) return;
    const res = await request(app).put(`${BASE}/products/${productId}`).send({ lifecycle_score: 90 });
    expect(res.status).toBe(200);
    expect(res.body.data.lifecycle_score).toBe(90);
  });

  test('DELETE /products/:id — soft delete', async () => {
    if (!productId) return;
    const res = await request(app).delete(`${BASE}/products/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('inactive');
  });
});

// ──────────────────────────────────────────────────────────────────────────
// ANALYTICS
// ──────────────────────────────────────────────────────────────────────────
describe('Analytics APIs', () => {
  const endpoints = ['monthly', 'yearly', 'departments', 'categories', 'highest-month', 'lowest-month', 'average-monthly', 'kpi'];
  endpoints.forEach(ep => {
    test(`GET /analytics/${ep}`, async () => {
      const res = await request(app).get(`${BASE}/analytics/${ep}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

// ──────────────────────────────────────────────────────────────────────────
// REPORTS
// ──────────────────────────────────────────────────────────────────────────
describe('Reports APIs', () => {
  const reportEndpoints = ['carbon', 'monthly', 'department', 'goals', 'esg-summary'];
  reportEndpoints.forEach(ep => {
    test(`GET /reports/${ep} — JSON`, async () => {
      const res = await request(app).get(`${BASE}/reports/${ep}?format=json`);
      expect(res.status).toBe(200);
    });
    test(`GET /reports/${ep} — CSV`, async () => {
      const res = await request(app).get(`${BASE}/reports/${ep}?format=csv`);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/csv/);
    });
  });
});

// ──────────────────────────────────────────────────────────────────────────
// SEARCH & FILTERS
// ──────────────────────────────────────────────────────────────────────────
describe('Search & Filter API', () => {
  test('GET /search — default (no filters)', async () => {
    const res = await request(app).get(`${BASE}/search`);
    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeDefined();
  });

  test('GET /search?department=Manufacturing', async () => {
    const res = await request(app).get(`${BASE}/search?department=Manufacturing`);
    expect(res.status).toBe(200);
  });

  test('GET /search?keyword=electricity', async () => {
    const res = await request(app).get(`${BASE}/search?keyword=electricity`);
    expect(res.status).toBe(200);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// CLEANUP
// ──────────────────────────────────────────────────────────────────────────
afterAll(async () => {
  // Clean up test emission factor (soft delete)
  await mongoose.connection.close();
});
