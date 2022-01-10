module.exports = {
	roots: ["<rootDir>/src"],
	testMatch: [
		"**/__tests__/**/*.+(ts|tsx|js)",
		"**/?(*.)+(translation).+(spec|test).+(ts|tsx|js)",
	],
	transform: {
		"^.+.(ts|tsx)$": "ts-jest",
	},
	globals: {
		"ts-jest": {
			tsConfig: "tsconfig.json",
		},
	},
};
