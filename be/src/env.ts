import fs from "fs";
import { execSync } from "child_process";
import dotenv from "dotenv";

if (!process.env.NODE_ENV) {
	console.error("NODE_ENV is not set");
	process.exit(1);
}

if (process.env.NODE_ENV === "test") {
	dotenv.config({ path: ".env.test" });

	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		console.error("DATABASE_URL is not set");
		process.exit(1);
	}

	const dbPath = databaseUrl.startsWith("file:")
		? databaseUrl.split("file:")[1]?.split("?")[0]
		: null;

	if (!dbPath) {
		console.error("Invalid DATABASE_URL format");
		process.exit(1);
	}

	// 데이터베이스 파일 삭제
	if (fs.existsSync(dbPath)) {
		console.log(`Deleting database file: ${dbPath}`);
		fs.unlinkSync(dbPath);
		console.log("Database file deleted.");
	} else {
		console.log(`Database file not found: ${dbPath}`);
	}

	// Prisma 스키마 재생성
	console.log("Recreating database schema...");
	execSync("npx prisma db push", { stdio: "inherit" });
	console.log("Database recreated successfully.");
} else {
	dotenv.config();
}
