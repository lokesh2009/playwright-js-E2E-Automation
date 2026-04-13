// @ts-check
import { defineConfig, devices } from '@playwright/test';
import { time } from 'console';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */


module.exports = {
  testDir: './tests/specs',
  testMatch: '**/*.spec.js',
  fullyParallel: true,
  workers:process.env.CI ? 4 : 6,
  retries: process.env.CI ? 2 : 0,
  timeout: 15*60*1000, // 5 minutes per test
  reporter: [
    ['list'],  // Console output
    ['html', { outputFolder: 'playwright-report', open: 'never' }],  // HTML report
    ['json', { outputFile: 'test-results/results.json' }],  // JSON results
    ['junit', { outputFile: 'test-results/junit.xml' }]  // JUnit for CI/CD
  ],

  use: {
    headless: false, 
    viewport: { width: 1280, height: 720 },
    browserName: 'chromium', 'edge' // Change to 'chromium' or 'firefox' as needed
    
  },
};


export default defineConfig({
  testDir: './tests',
  reporter: [
    ['list'], 
    ['html', { outputFolder: 'playwright-report', open: 'on-failure' }]
  ],
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
 

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop chromium'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

