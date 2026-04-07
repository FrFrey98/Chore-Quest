import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3001',
    storageState: 'e2e/.auth/user.json',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { storageState: undefined },
    },
    {
      name: 'tests',
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'DATABASE_URL=file:./test.db NEXTAUTH_URL=http://localhost:3001 npm run dev -- --port 3001',
    port: 3001,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
})
