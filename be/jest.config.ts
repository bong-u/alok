process.env.NODE_ENV = "test";
require("dotenv").config({ path: ".env.test" });
require("child_process").execSync("npx prisma db push --accept-data-loss");

module.exports = {
	preset: "ts-jest", // Ts-jest를 사용하여 TypeScript를 트랜스파일링
	testEnvironment: "node", // 테스트 환경을 Node.js로 설정
	moduleFileExtensions: ["ts", "js"], // Jest가 인식할 파일 확장자 설정
	testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)"], // 테스트 파일 패턴 (ex. *.test.ts)
	maxWorkers: 1,
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
	transform: {
		"^.+\\.ts?$": [
			"ts-jest",
			{
				// Ts-jest에 대한 설정을 transform 내부에 추가
				tsconfig: "tsconfig.json", // Tsconfig.json 파일을 사용하여 TypeScript 설정
			},
		],
	},
	// CollectCoverage: true,
	// collectCoverageFrom: ['src/**/*.{ts,js}'],
};
