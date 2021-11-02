// cucumber.js
let common = [
  'features/**/*.feature',                // Specify our feature files
  '--require etc/cucumber-js/ts-node-register.js',    // Load TypeScript module
  '--require tests/features/step-definitions/**/*.ts',   // Load step definitions
  '--format progress-bar',                // Load custom formatter
  '--publish-quiet',
//  '--format node_modules/cucumber-pretty' // Load custom formatter
].join(' ');

module.exports = {
  default: common
};

