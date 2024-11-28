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
import attendeeRouter from "../src/routers/attendee-router";
import redis from "../src/redis";
import JwtUtil from "../src/utils/jwt-util";
import TestUtil from "../src/utils/test-util";

const prisma = new PrismaClient();

describe("Attendee Router", () => {
	let app: express.Application;

	beforeAll(async () => {
		app = express();
		app.use(express.json());
		app.use(authMiddleware, attendeeRouter());
	});

	beforeEach(async () => {
		await prisma.attendee.deleteMany();
	});

	afterAll(async () => {
		await redis.quit();
	});

	describe("POST /api/attendees/:attendeeName?recordId=:recordId", () => {
		it("새로운 참여자 추가 - 200", async () => {
			const user = await TestUtil.createUser();
			const record = await TestUtil.createRecord(
				"2024-01-01",
				"soju",
				1,
				user.id
			);

			const res = await request(app)
				.post("/김철수")
				.query({ recordId: record.id })
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);

			expect(res.status).toBe(200);
		});
		it("이미 존재하는 참여자 추가 - 400", async () => {
			const user = await TestUtil.createUser();
			const record = await TestUtil.createRecord(
				"2024-01-01",
				"soju",
				1,
				user.id
			);
			await prisma.attendee.create({
				data: {
					name: "김철수",
					user: {
						connect: {
							id: user.id,
						},
					},
				},
			});

			const res = await request(app)
				.post("/김철수")
				.query({ recordId: record.id })
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);

			expect(res.status).toBe(200);
		});
	});

	describe("GET /api/attendees", () => {
		it("등록된 참여자 목록 조회 - 200", async () => {
			const user = await TestUtil.createUser();
			const attendee1 = await TestUtil.createAttendee("김철수", user.id);
			const attendee2 = await TestUtil.createAttendee("김영희", user.id);

			const res = await request(app)
				.get("/")
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);

			expect(res.status).toBe(200);
			expect(res.body).toEqual(["김철수", "김영희"]);
		});
	});

	describe("DELETE /api/attendees/:attendeeName?recordId=:recordId", () => {
		it("참여자를 기록에서 삭제 - 200", async () => {
			const user = await TestUtil.createUser();
			const record = await TestUtil.createRecord(
				"2024-01-01",
				"soju",
				1,
				user.id
			);
			const attendee = await TestUtil.createAttendee("김철수", user.id);

			await prisma.recordAttendee.create({
				data: {
					record: {
						connect: { id: record.id },
					},
					attendee: {
						connect: { id: attendee.id },
					},
				},
			});

			const res = await request(app)
				.delete("/김철수")
				.query({ recordId: record.id })
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);

			expect(res.status).toBe(200);
			expect(res.text).toBe("Attendee deleted successfully");

			const recordAttendees = await prisma.recordAttendee.findMany({
				where: { recordId: record.id },
			});
			expect(recordAttendees.length).toBe(0);

			const dbAttendee = await prisma.attendee.findUnique({
				where: { id: attendee.id },
			});
			expect(dbAttendee).toBeNull();
		});

		it("존재하지 않는 참여자 삭제 시도 - 404", async () => {
			const user = await TestUtil.createUser();
			const record = await TestUtil.createRecord(
				"2024-01-01",
				"soju",
				1,
				user.id
			);

			const res = await request(app)
				.delete("/김영희")
				.query({ recordId: record.id })
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);

			expect(res.status).toBe(404);
			expect(res.text).toBe("Attendee not found");
		});

		it("존재하지 않는 기록에서 삭제 시도 - 404", async () => {
			const user = await TestUtil.createUser();

			const res = await request(app)
				.delete("/김철수")
				.query({ recordId: 999 })
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);

			expect(res.status).toBe(404);
			expect(res.text).toBe("Record not found");
		});
	});
});
