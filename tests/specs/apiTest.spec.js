// src/api/tests/apiTest.spec.js
import { test, expect } from '@playwright/test';

test.describe('API Smoke Tests', () => {
  test('Fakestore: GET /products returns list', async ({ request }) => {
    const response = await request.get('https://fakestoreapi.com/products');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
  });

  test('Reqres: GET /api/users/2 returns user object', async ({ request }) => {
    const response = await request.get('https://reqres.in/api/users/2');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(body.data).toBeDefined();
    expect(typeof body.data.email).toBe('string');
    expect(body.data.email).toContain('@');
  });

  test('Search API example (simulate product search)', async ({ request }) => {
    const res = await request.get('https://fakestoreapi.com/products/category/electronics');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBeTruthy();
  });
});
