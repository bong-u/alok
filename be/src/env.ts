import { execSync } from "child_process";
import dotenv from "dotenv";
import prisma from "./prisma";

const resetDatabase = async () => {
	await prisma.$executeRawUnsafe(
		`TRUNCATE TABLE member, date RESTART IDENTITY CASCADE;`
	);
	prisma.$disconnect();
};

if (!process.env.NODE_ENV) {
	console.error("NODE_ENV is not set");
	process.exit(1);
}

if (process.env.NODE_ENV === "test") {
	dotenv.config({ path: ".env.test", override: true });

	console.log(process.env.DATABASE_URL);
	if (!process.env.DATABASE_URL) {
		console.error("DATABASE_URL is not set");
		process.exit(1);
	}

	resetDatabase();
	execSync("npx prisma db push", { stdio: "inherit" });
	console.log("Database recreated successfully.");
} else {
	dotenv.config();
}
