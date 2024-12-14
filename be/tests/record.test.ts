import prisma from "../src/prisma";
import authMiddleware from "../src/middlewares/auth.middleware";
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
import recordRouter from "../src/routers/record.router";
import redis from "../src/redis";
import JwtUtil from "../src/utils/jwt.util";
import TestUtil from "../src/utils/test.util";

describe("Record Router", () => {
	let app: express.Application;

	beforeAll(async () => {
		app = express();
		app.use(express.json());
		app.use(authMiddleware, recordRouter());
	});

	beforeEach(async () => {
		await prisma.record.deleteMany();
		await prisma.date.deleteMany();
		await prisma.user.deleteMany();
	});

	afterAll(async () => {
		await redis.quit();
	});

	describe("POST /api/records", () => {
		it("중복된 데이터 - 409", async () => {
			const user = await TestUtil.createUser();
			const dateId = (await TestUtil.createDate("2024-01-01")).id;
			await TestUtil.createRecord(dateId, "soju", 3.5, user.id);
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
			const dateId1 = (await TestUtil.createDate("2024-01-01")).id;
			const dateId2 = (await TestUtil.createDate("2024-01-02")).id;
			await TestUtil.createRecord(dateId1, "soju", 3.5, user1.id);
			await TestUtil.createRecord(dateId2, "soju", 3.5, user2.id);

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
			const dateId1 = (await TestUtil.createDate("2024-01-01")).id;
			const dateId2 = (await TestUtil.createDate("2024-01-02")).id;
			await TestUtil.createRecord(dateId1, "soju", 3.5, user.id);
			await TestUtil.createRecord(dateId2, "soju", 3.5, user.id);

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

			const dateId1 = (await TestUtil.createDate("2024-01-01")).id;
			const dateId2 = (await TestUtil.createDate("2024-01-02")).id;
			await TestUtil.createRecord(dateId1, "soju", 3.5, user1.id);
			await TestUtil.createRecord(dateId2, "soju", 2.5, user2.id);

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

	describe("PATCH /api/records/:date/:recordType", () => {
		it("record 수정 - 200", async () => {
			const user = await TestUtil.createUser();
			const dateId = (await TestUtil.createDate("2024-01-01")).id;
			const recordId = (
				await TestUtil.createRecord(dateId, "soju", 3.5, user.id)
			).id;

			const res = await request(app)
				.patch("/2024-01-01/soju")
				.send({ amount: 4 })
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);
			expect(res.status).toBe(200);

			const recordObj = await prisma.record.findUnique({
				where: { id: recordId },
			});
			expect(recordObj?.amount).toBe(4);
		});

		it("잘못된 형식의 데이터 - 400", async () => {
			const user = await TestUtil.createUser();
			const res = await request(app)
				.patch("/2024-01-01/soj")
				.send({ amount: "7" })
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);
			expect(res.status).toBe(400);
		});

		it("존재하지 않는 데이터 - 404", async () => {
			const user = await TestUtil.createUser();
			const res = await request(app)
				.patch("/2024-01-01/soju")
				.send({ amount: 5.5 })
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);
			expect(res.status).toBe(404);
		});
	});

	describe("DELETE /api/records/:date/:recordType", () => {
		it("record 삭제 (date도 삭제) - 200", async () => {
			const user = await TestUtil.createUser();
			const dateId = (await TestUtil.createDate("2024-01-01")).id;
			const recordId = (
				await TestUtil.createRecord(dateId, "soju", 3.5, user.id)
			).id;

			const res = await request(app)
				.delete("/2024-01-01/soju")
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);
			expect(res.status).toBe(200);

			// record가 삭제되었는지 확인
			const recordObj = await prisma.record.findUnique({
				where: { id: recordId },
			});
			expect(recordObj).toBeNull();

			// date가 삭제되었는지 확인
			const dateObj = await prisma.date.findUnique({
				where: { id: dateId },
			});
			expect(dateObj).toBeNull();
		});

		it("record 삭제 (date는 유지) - 200", async () => {
			const user = await TestUtil.createUser();
			const dateId = (await TestUtil.createDate("2024-01-01")).id;
			const recordId = (
				await TestUtil.createRecord(dateId, "soju", 3.5, user.id)
			).id;
			await TestUtil.createRecord(dateId, "beer", 2.5, user.id);

			const res = await request(app)
				.delete("/2024-01-01/soju")
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);
			expect(res.status).toBe(200);

			// record가 삭제되었는지 확인
			const recordObj = await prisma.record.findUnique({
				where: { id: recordId },
			});
			expect(recordObj).toBeNull();

			// date가 유지되는지 확인
			const dateObj = await prisma.date.findUnique({
				where: { id: dateId },
			});
			expect(dateObj).not.toBeNull();
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
