import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'test-results/e2e-results.json' }]],
  use: {
    baseURL: process.env.DEMO_QA_URL || 'http://127.0.0.1:3100',
    launchOptions: { executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' },
    viewport: { width: 1440, height: 1000 },
    screenshot: 'only-on-failure',
  },
});
