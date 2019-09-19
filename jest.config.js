// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  clearMocks: true,

  // If we need something more sophisticated (or simpler to understand)
  // there’s a regexp version of this option, somewhere
  testMatch: [
    // "**/__tests__/*.[jt]s?(x)",
    "**/*_test.bs.js"
  ],
};
