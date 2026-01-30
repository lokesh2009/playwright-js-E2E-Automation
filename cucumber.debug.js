module.exports = {
  default: {
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
