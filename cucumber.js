module.exports = {
  default: {
    require: [
      'tests/steps/**/*.js',
      'Setup/hooks.js'
    ],
    format: [
      'progress',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
      // Allure formatter — writes per-test result JSON files to allure-results/
      // so `allure generate allure-results` produces a full interactive report
      'allure-cucumberjs/reporter'
    ],
    formatOptions: {
      resultsDir: 'allure-results'
    },
    paths: ['tests/features/**/*.feature'],
    parallel: 0,
    timeout: 120000,
    tags: '',
    worldParameters: {
      baseURL: ''
    }
  },

  smoke: {
    require: [
      'tests/steps/**/*.js',
      'Setup/hooks.js'
    ],
    format: [
      'progress',
      'html:reports/smoke-report.html',
      'allure-cucumberjs/reporter'
    ],
    formatOptions: {
      resultsDir: 'allure-results'
    },
    paths: ['tests/features/**/*.feature'],
    tags: '@smoke',
    parallel: 0,
    timeout: 120000
  },

  regression: {
    require: [
      'tests/steps/**/*.js',
      'Setup/hooks.js'
    ],
    format: [
      'progress',
      'html:reports/regression-report.html',
      'allure-cucumberjs/reporter'
    ],
    formatOptions: {
      resultsDir: 'allure-results'
    },
    paths: ['tests/features/**/*.feature'],
    tags: '@regression',
    parallel: 0,
    timeout: 120000
  },

  debug: {
    require: [
      'Setup/hooks.js',
      'tests/steps/ui/login_steps.js'
    ],
    format: ['progress'],
    paths: ['tests/features/UIFeature/login.feature'],
    timeout: 120000,
    parallel: 0
  }
};
