const { defineConfig, devices } = require("@playwright/test");

/* The workbook is static files, so the suite serves the repo and drives a real
   browser against it. That is the only environment where Pyodide actually runs,
   and therefore the only place these tests mean anything. */
module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 15 * 60 * 1000,
  expect: { timeout: 15000 },
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://127.0.0.1:8080",
    trace: process.env.CI ? "retain-on-failure" : "off"
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "python3 -m http.server 8080 --bind 127.0.0.1",
    url: "http://127.0.0.1:8080/index.html",
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000
  }
});
