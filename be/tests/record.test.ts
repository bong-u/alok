import { PrismaClient } from "@prisma/client";
import authMiddleware from "../src/middlewares/auth-middleware";
import express from "express";
import {
	describe,
	beforeAll,
	beforeEach,
	afterAll,
	it,
	expect,
} from "@jest/globals";
import request from "supertest";
import recordRouter from "../src/routers/record-router";
import redis from "../src/redis";
import JwtUtil from "../src/utils/jwt-util";
import TestUtil from "../src/utils/test-util";

const prisma = new PrismaClient();

describe("Record Router", () => {
	let app: express.Application;

	beforeAll(async () => {
		app = express();
		app.use(express.json());
		app.use(authMiddleware, recordRouter());
	});

	beforeEach(async () => {
		await prisma.record.deleteMany();
		await prisma.user.deleteMany();
	});

	afterAll(async () => {
		await redis.quit();
	});

	describe("POST /api/records", () => {
		it("중복된 데이터 - 409", async () => {
			const user = await TestUtil.createUser();
			await prisma.record.create({
				data: {
					date: "2024-01-01",
					recordType: "soju",
					amount: 3.5,
					userId: user.id,
				},
			});
			const res = await request(app)
				.post("/")
				.send({
					date: "2024-01-01",
					recordType: "soju",
					amount: 3.5,
				})
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);
			expect(res.status).toBe(409);
		});
		it("CREATE - 201", async () => {
			const user = await TestUtil.createUser();
			const res = await request(app)
				.post("/")
				.send({
					date: "2024-01-01",
					recordType: "soju",
					amount: 3.5,
				})
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);
			expect(res.status).toBe(201);
		});
	});

	describe("GET /records/2024", () => {
		it("빈 데이터 조회 - 200", async () => {
			const user = await TestUtil.createUser();
			const response = await request(app)
				.get("/2024")
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);
			expect(response.status).toBe(200);
			expect(response.body).toMatchObject({});
		});
		it("연별 데이터 조회 - 200", async () => {
			const user1 = await TestUtil.createUser();
			const user2 = await TestUtil.createUser();
			await prisma.record.createMany({
				data: [
					{
						date: "2024-01-01",
						recordType: "soju",
						amount: 3.5,
						userId: user1.id,
					},
					{
						date: "2024-01-02",
						recordType: "soju",
						amount: 3.5,
						userId: user2.id,
					},
				],
			});
			const response = await request(app)
				.get("/2024")
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user1.id)}`
				);
			expect(response.status).toBe(200);
			expect(response.body).toMatchObject({
				"2024-01": [{ recordType: "soju", amount: 3.5 }],
			});
		});
		it("잘못된 형식의 년도 - 400", async () => {
			const user = await TestUtil.createUser();
			const response = await request(app)
				.get("/2024a")
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);
			expect(response.status).toBe(400);
		});
	});
	describe("GET /records/2024/1", () => {
		it("빈 데이터 조회 - 200", async () => {
			const user = await TestUtil.createUser();
			const response = await request(app)
				.get("/2024/01")
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);
			expect(response.status).toBe(200);
			expect(response.body).toMatchObject({});
		});
		it("월별 데이터 조회 - 200", async () => {
			const user = await TestUtil.createUser();
			await prisma.record.createMany({
				data: [
					{
						date: "2024-01-01",
						recordType: "soju",
						amount: 3.5,
						userId: user.id,
					},
					{
						date: "2024-01-02",
						recordType: "soju",
						amount: 3.5,
						userId: user.id,
					},
				],
			});
			const response = await request(app)
				.get("/2024/01")
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);
			expect(response.status).toBe(200);
			expect(response.body).toMatchObject({
				"2024-01-01": [{ recordType: "soju", amount: 3.5 }],
			});
		});
		it("잘못된 형식의 월 - 400", async () => {
			const user = await TestUtil.createUser();
			const response = await request(app)
				.get("/2024/12b")
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);
			expect(response.status).toBe(400);
		});
	});

	describe("GET /records/:year/:month/user/:userId", () => {
		it("빈 데이터 조회 - 200", async () => {
			const user1 = await TestUtil.createUser();
			const user2 = await TestUtil.createUser();

			const response = await request(app)
				.get(`/2024/01/user/${user1.id}`)
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user2.id)}`
				);
			expect(response.status).toBe(200);
			expect(response.body).toMatchObject({});
		});

		it("월별 데이터 조회 - 200", async () => {
			const user1 = await TestUtil.createUser();
			const user2 = await TestUtil.createUser();

			await prisma.record.createMany({
				data: [
					{
						date: "2024-01-01",
						recordType: "soju",
						amount: 3.5,
						userId: user1.id,
					},
					{
						date: "2024-01-02",
						recordType: "soju",
						amount: 2.5,
						userId: user2.id,
					},
				],
			});
			const response = await request(app)
				.get(`/2024/01/user/${user1.id}`)
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user2.id)}`
				);
			expect(response.status).toBe(200);
			expect(response.body).toMatchObject({
				"2024-01-01": [{ recordType: "soju", amount: 3.5 }],
			});
		});
	});

	describe("DELETE /api/records/:date/:recordType", () => {
		it("DELETE - 200", async () => {
			const user = await TestUtil.createUser();
			await prisma.record.create({
				data: {
					date: "2024-01-01",
					recordType: "soju",
					amount: 3.5,
					userId: user.id,
				},
			});
			const res = await request(app)
				.delete("/2024-01-01/soju")
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);
			expect(res.status).toBe(200);
		});

		it("존재하지 않는 데이터 - 404", async () => {
			const user = await TestUtil.createUser();
			const res = await request(app)
				.delete("/2024-01-01/soju")
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);
			expect(res.status).toBe(404);
		});
	});
});
