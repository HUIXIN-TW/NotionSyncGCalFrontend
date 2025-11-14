const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@app/(.*)$": "<rootDir>/src/app/$1",
    "^@api/(.*)$": "<rootDir>/src/app/api/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@styles/(.*)$": "<rootDir>/src/styles/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@models/(.*)$": "<rootDir>/src/models/$1",
    "^@templates/(.*)$": "<rootDir>/src/templates/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@hooks/(.*)$": "<rootDir>/src/hooks/$1",
  },
};

module.exports = createJestConfig(customJestConfig);
