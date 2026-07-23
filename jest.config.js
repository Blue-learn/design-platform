/** @type {import('jest').Config} */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	// The renderer pulls react-native, which ships untranspiled ESM. Only the
	// framework-free modules are unit-tested here.
	testMatch: ["<rootDir>/src/**/__tests__/**/*.test.ts"],
	collectCoverageFrom: [
		"src/**/*.{ts,tsx}",
		"!src/**/*.d.ts",
		"!src/**/__tests__/**",
	],
	// Coverage threshold, enforced in CI. Measured across all of src/: 52.44%
	// statements, 49.16% branches, 55.47% functions, 51.9% lines. The tested
	// modules themselves sit above 90%; the gap is the react-native-dependent
	// renderer surface, which cannot be unit-tested here (see testMatch above).
	// This ships as a versioned package, so a coverage regression reaches
	// consumers.
	coverageThreshold: {
		global: {
			statements: 52,
			branches: 48,
			functions: 55,
			lines: 51,
		},
	},
};
