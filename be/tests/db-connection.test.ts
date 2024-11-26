import { PrismaClient } from "@prisma/client";
import redis from "../src/redis";
import { describe, it, expect, afterAll } from "@jest/globals";

const prisma = new PrismaClient();

describe("Database Connection", () => {
	afterAll(async () => {
		await redis.quit();
	});
	it("데이터베이스 연결 테스트", async () => {
		const result = await prisma.$queryRaw`SELECT 1`;
		expect(result).toBeDefined();
	});

	it("Redis 연결 테스트", async () => {
		await redis.set("key", "value");
		const value = await redis.get("key");
		expect(value).toBe("value");

		await redis.del("key");
	});
});
