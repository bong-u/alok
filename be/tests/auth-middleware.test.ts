import prisma from "../src/prisma";
import redis from "../src/redis";
import {
	describe,
	it,
	expect,
	beforeAll,
	afterEach,
	afterAll,
} from "@jest/globals";
import request from "supertest";
import express from "express";
import recordRouter from "../src/routers/record.router";
import authMiddleware from "../src/middlewares/auth.middleware";
import jwtUtil from "../src/utils/jwt.util";

describe("Record Router", () => {
	let app: express.Application;

	beforeAll(async () => {
		app = express();
		app.use(express.json());
		app.use(authMiddleware);
		app.use(recordRouter());
	});

	afterEach(async () => {
		await prisma.record.deleteMany();
	});

	afterAll(async () => {
		await redis.quit();
	});

	describe("GET /record/2024", () => {
		it("인증 성공", async () => {
			const token = await jwtUtil.generateAccessToken(1);
			const response = await request(app)
				.get("/2024")
				.set("Authorization", `Bearer ${token}`);
			expect(response.status).toBe(200);
		});

		it("인증 실패", async () => {
			const response = await request(app).get("/2024");
			expect(response.status).toBe(401);
		});
	});
});
