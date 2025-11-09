module.exports = {
  default: {
    require: [
      'tests/steps/**/*.js',     // All step definition files
      'Setup/hooks.js'           // Hooks, custom world, etc.
    ],
    format: [
      'progress',                                // Console output
      'html:reports/cucumber-report.html',       // HTML report
      'json:reports/cucumber-report.json'        // JSON report (optional)
    ],
    paths: ['tests/features/**/*.feature'],      // All .feature files
    publishQuiet: true,                          // Disable public report upload
    parallel: 0,                                 // Sequential execution
    tags: '',                                    // Optional: filter by @tags
    worldParameters: {
      baseURL: 'https://www.sargentsequipmentwi.com/' // Example global parameter
    }
  }
};
