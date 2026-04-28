/** @type {import('jest').Config} */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	// The renderer pulls react-native, which ships untranspiled ESM. Only the
	// framework-free modules are unit-tested here.
	testMatch: ["<rootDir>/src/**/__tests__/**/*.test.ts"],
};
