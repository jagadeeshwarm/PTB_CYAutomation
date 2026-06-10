const { defineConfig } = require('cypress')

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    reportFilename: '[datetime]-[status]-report',
    reportPageTitle: 'PTB Automation Report',
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },
  e2e: {
    baseUrl: 'https://staging.plantobuild.online',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    testIsolation: false,
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      const {
        xlsxRead,
        xlsxEditCell,
        xlsxRestore,
      } = require('./cypress/support/utils/xlsxNodeUtils');
      on('task', { xlsxRead, xlsxEditCell, xlsxRestore });
    },
  },
})
