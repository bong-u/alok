import { PrismaClient } from "@prisma/client";
import authMiddleware from "../src/middlewares/auth.middleware";
import express from "express";
import { describe, beforeAll, beforeEach, afterAll, it, expect } from "@jest/globals";
import request from "supertest";
import attendeeRouter from "../src/routers/attendee.router";
import redis from "../src/redis";
import JwtUtil from "../src/utils/jwt.util";
import TestUtil from "../src/utils/test.util";

const prisma = new PrismaClient();

describe("Attendee Router", () => {
	let app: express.Application;

	beforeAll(async () => {
		app = express();
		app.use(express.json());
		app.use(authMiddleware, attendeeRouter());
	});

	beforeEach(async () => {
		await prisma.date.deleteMany();
		await prisma.attendee.deleteMany();
	});

	afterAll(async () => {
		await redis.quit();
	});

	describe("POST /api/attendees/:date/:attendeeName", () => {
		it("참여자 추가 (기록이 있는 참여자)- 200", async () => {
			const user = await TestUtil.createUser();
			await TestUtil.createAttendee("김철수", user.id);
			await TestUtil.createDate("2024-01-01");

			const response = await request(app)
				.post("/2024-01-01/김철수")
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);

			expect(response.status).toBe(200);
		});

		it("참여자 추가 (신규 참여자)- 200", async () => {
			const user = await TestUtil.createUser();
			await TestUtil.createDate("2024-01-01");

			const response = await request(app)
				.post("/2024-01-01/김철수")
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);
			expect(response.status).toBe(200);
		});

		it("이미 추가된 참여자 추가 시도 - 409", async () => {
			const user = await TestUtil.createUser();
			const attendee = await TestUtil.createAttendee("김철수", user.id);
			const date = await TestUtil.createDate("2024-01-01");
			await TestUtil.connectAttendeeToDate(attendee.id, date.id);

			const response = await request(app)
				.post("/2024-01-01/김철수")
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);
			expect(response.status).toBe(409);
		});

		it("date가 없는 경우 - 404", async () => {
			const user = await TestUtil.createUser();

			const response = await request(app)
				.post("/2024-01-01/김철수")
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);
			expect(response.status).toBe(404);
		});
	});

	describe("GET /api/attendees/", () => {
		it("친구 목록 조회 - 200", async () => {
			const user = await TestUtil.createUser();
			const attendee1 = await TestUtil.createAttendee("김철수", user.id);
			const attendee2 = await TestUtil.createAttendee("김영희", user.id);
			const date = await TestUtil.createDate("2024-01-01");

			await TestUtil.connectAttendeeToDate(attendee1.id, date.id);
			await TestUtil.connectAttendeeToDate(attendee2.id, date.id);

			const response = await request(app)
				.get("/")
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);

			expect(response.status).toBe(200);
			expect(response.body).toEqual([
				{ id: attendee1.id, name: attendee1.name },
				{ id: attendee2.id, name: attendee2.name },
			]);
		});
	});

	describe("GET /api/attendees/:date", () => {
		it("특정 날짜의 참여자 목록 조회 - 200", async () => {
			const user = await TestUtil.createUser();
			const attendee1 = await TestUtil.createAttendee("김철수", user.id);
			const attendee2 = await TestUtil.createAttendee("김영희", user.id);
			const date = await TestUtil.createDate("2024-01-01");

			await TestUtil.connectAttendeeToDate(attendee1.id, date.id);
			await TestUtil.connectAttendeeToDate(attendee2.id, date.id);

			const response = await request(app)
				.get("/2024-01-01")
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);

			expect(response.status).toBe(200);
			expect(response.body).toEqual([
				{ id: attendee1.id, name: attendee1.name },
				{ id: attendee2.id, name: attendee2.name },
			]);
		});
	});

	describe("DELETE /api/attendees/:date/:attendeeName", () => {
		it("참여자 삭제 - 200", async () => {
			const user = await TestUtil.createUser();
			const attendee = await TestUtil.createAttendee("김철수", user.id);
			const date = await TestUtil.createDate("2024-01-01");
			await TestUtil.connectAttendeeToDate(attendee.id, date.id);

			const response = await request(app)
				.delete("/2024-01-01/김철수")
				.set(
					"Authorization",
					`Bearer ${JwtUtil.generateAccessToken(user.id)}`
				);

			expect(response.status).toBe(200);

			// 참여자 삭제 확인
			const attendees = await prisma.attendee.findUnique({
				where: { id: attendee.id },
			});
			expect(attendees).toBeNull();

			// date와의 연결 삭제 확인
			const dateAttendee = await prisma.dateAttendee.findFirst({
				where: { attendeeId: attendee.id },
			});
			expect(dateAttendee).toBeNull();
		});
	});
});
