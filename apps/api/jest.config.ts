import type { Config } from "jest";

const config: Config = {
	rootDir: ".",
	moduleFileExtensions: ["js", "json", "ts"],
	testRegex: ".*\\.spec\\.ts$",
	transform: {
		"^.+\\.(t|j)s$": "ts-jest",
	},
	moduleNameMapper: {
		"^src/(.*)$": "<rootDir>/src/$1",
		"^drizzle/(.*)$": "<rootDir>/drizzle/$1",
	},
	collectCoverageFrom: ["src/**/*.(t|j)s"],
	coverageDirectory: "coverage",
	testEnvironment: "node",
};

export default config;
