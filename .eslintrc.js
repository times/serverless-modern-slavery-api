module.exports = {
  globals: {
    document: false,
    window: false
  },
  env: {
    es6: true,
    node: true
  },
  extends: "eslint:recommended",
  rules: {
    "linebreak-style": ["error", "unix"],
    "no-eval": ["error"],
    eqeqeq: ["error"],
    "no-unused-expressions": 1,
    "no-unused-vars": 1,
    "no-useless-constructor": 1,
    "no-debugger": 1
  },
  plugins: []
};
