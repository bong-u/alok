import { PrismaClient } from "@prisma/client";
import request from "supertest";
import {
	describe,
	beforeAll,
	beforeEach,
	afterAll,
	it,
	expect,
} from "@jest/globals";
import express from "express";
import userRouter from "../src/routers/user-router";
import redis from "../src/redis";
import TokenService from "../src/services/token-service";
import TestUtil from "../src/utils/test-util";

const prisma = new PrismaClient();
const TEST_RECAPTCHA_TOKEN = "test";

describe("User Router", () => {
	let app: express.Application;

	beforeAll(async () => {
		app = express();
		app.use(express.json());
		app.use(userRouter());
	});

	beforeEach(async () => {
		await prisma.user.deleteMany();
	});

	afterAll(async () => {
		await redis.quit();
	});

	describe("GET /api/users/me", () => {
		it("로그인한 사용자 정보 조회", async () => {
			const user = await TestUtil.createUser();
			const accessToken = TokenService.generateAccessToken(user.id);

			const response = await request(app)
				.get("/me")
				.set("Authorization", `Bearer ${accessToken}`);
			expect(response.status).toBe(200);
			expect(response.body.id).toBe(user.id);
			expect(response.body.username).toBe(user.username);
		});

		it("로그인하지 않은 사용자 정보 조회 실패", async () => {
			const response = await request(app).get("/me");
			expect(response.status).toBe(401);
		});

		it("삭제된 사용자 정보 조회 실패", async () => {
			const user = await TestUtil.createUser(true);
			const accessToken = TokenService.generateAccessToken(user.id);

			const response = await request(app)
				.get("/me")
				.set("Authorization", `Bearer ${accessToken}`);
			expect(response.status).toBe(404);
		});
	});

	describe("GET /api/users/all", () => {
		it("모든 사용자 정보 조회", async () => {
			const user1 = await TestUtil.createUser();
			const user2 = await TestUtil.createUser();
			const accessToken = TokenService.generateAccessToken(user1.id);

			const response = await request(app)
				.get("/all")
				.set("Authorization", `Bearer ${accessToken}`);

			expect(response.status).toBe(200);

			expect(response.body).toContainEqual({
				id: user1.id,
				username: user1.username,
			});
			expect(response.body).toContainEqual({
				id: user2.id,
				username: user2.username,
			});
		});

		it("로그인하지 않은 사용자 정보 조회 실패", async () => {
			const response = await request(app).get("/all");
			expect(response.status).toBe(401);
		});

		it("삭제된 사용자 정보 조회 실패", async () => {
			const user = await TestUtil.createUser(true);
			const accessToken = TokenService.generateAccessToken(user.id);

			const response = await request(app)
				.get("/all")
				.set("Authorization", `Bearer ${accessToken}`);
			expect(response.status).toBe(200);
			expect(response.body).toEqual([]);
		});
	});

	describe("POST /api/users/signup", () => {
		it("새로운 사용자 생성", async () => {
			const response = await request(app).post("/signup").send({
				username: "testuser1",
				password: "testpassword1",
				recaptchaToken: TEST_RECAPTCHA_TOKEN,
			});

			expect(response.status).toBe(201);

			const user = await prisma.user.findUnique({
				where: { username: "testuser1" },
			});
			expect(user).toBeTruthy();

			if (user) {
				expect(
					await TestUtil.comparePassword(
						"testpassword1",
						user.password
					)
				).toBeTruthy();
			}
		});

		it("중복된 username으로 사용자 생성 실패", async () => {
			const user = await TestUtil.createUser();
			const response = await request(app).post("/signup").send({
				username: user.username,
				password: "testuser1",
				recaptchaToken: TEST_RECAPTCHA_TOKEN,
			});
			expect(response.status).toBe(409);
		});

		const SIGNUP_400_TEST_DATA = [
			{
				username: "123", // 4글자 미만
				password: "testuser1",
			},
			{
				username: "123456789012345678901", // 20글자 초과
				password: "testuser1",
			},
			{
				username: "testuser!", // 특수문자 포함
				password: "testuser1",
			},
			{
				username: "test user", // 공백 포함
				password: "testuser1",
			},
			{
				username: "testuser1",
				password: "a234567", // 8글자 미만
			},
			{
				username: "testuser1",
				password: "a23456789012345678901", // 20글자 초과
			},
			{
				username: "testuser1",
				password: "test user123", // 공백 포함
			},
		];

		it.each(SIGNUP_400_TEST_DATA)(
			"사용자 생성 실패 #%# - 400",
			async (data) => {
				const response = await request(app).post("/signup").send({
					username: data.username,
					password: data.password,
					recaptchaToken: TEST_RECAPTCHA_TOKEN,
				});
				expect(response.status).toBe(400);
			}
		);
	});

	describe("POST /api/users/login", () => {
		it("로그인 성공", async () => {
			const user = await TestUtil.createUser();
			const response = await request(app).post("/login").send({
				username: user.username,
				password: user.plainPassword,
			});

			expect(response.status).toBe(200);
			expect(response.body.access_token).toBeTruthy();
			expect(response.body.refresh_token).toBeTruthy();
		});

		it("로그인 실패", async () => {
			await TestUtil.createUser();
			const response = await request(app)
				.post("/login")
				.send({ username: "testuser", password: "wrongpassword" });

			expect(response.status).toBe(401);
		});

		it("로그아웃", async () => {
			const user = await TestUtil.createUser();

			const accessToken = TokenService.generateAccessToken(user.id);
			const refreshToken = TokenService.generateRefreshToken(user.id);

			const logoutResponse = await request(app).post("/logout").send({
				access_token: accessToken,
				refresh_token: refreshToken,
			});

			expect(logoutResponse.status).toBe(204);

			// access token이 블랙리스트에 추가되었는지 확인
			const blockedResponse1 = await request(app)
				.get("/me")
				.set("Authorization", `Bearer ${accessToken}`);
			expect(blockedResponse1.status).toBe(401);

			// refresh token이 블랙리스트에 추가되었는지 확인
			const blockedResponse2 = await request(app)
				.post("/refresh")
				.send({ refresh_token: refreshToken });
			expect(blockedResponse2.status).toBe(401);
		});
	});
	describe("POST /api/users/refresh", () => {
		it("토큰 재발급", async () => {
			const user = await TestUtil.createUser();

			TokenService.generateAccessToken(user.id);
			const refreshToken = TokenService.generateRefreshToken(user.id);

			const response = await request(app)
				.post("/refresh")
				.send({ refresh_token: refreshToken });

			const newAccessToken = response.body.access_token;

			expect(response.status).toBe(200);
			expect(newAccessToken).toBeTruthy();

			// 새로 발급된 access token으로 요청이 성공하는지 확인
			const newAccessTokenResponse = await request(app)
				.get("/me")
				.set("Authorization", `Bearer ${newAccessToken}`);
			expect(newAccessTokenResponse.status).toBe(200);
		});

		it("만료된 refresh token으로 토큰 재발급 실패", async () => {
			const user = await TestUtil.createUser();

			TokenService.generateAccessToken(user.id);
			const refreshToken = "INVALID_REFRESH_TOKEN";

			const response = await request(app)
				.post("/refresh")
				.send({ refresh_token: refreshToken });

			expect(response.status).toBe(401);
		});
	});

	describe("PATCH /api/users/password", () => {
		it("비밀번호 변경", async () => {
			const user = await TestUtil.createUser();
			const accessToken = TokenService.generateAccessToken(user.id);

			const response = await request(app)
				.patch("/password")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					old_password: user.plainPassword,
					new_password: "newpassword1",
				});

			expect(response.status).toBe(204);

			const updatedUser = await prisma.user.findUnique({
				where: { id: user.id },
			});

			expect(
				await TestUtil.comparePassword(
					"newpassword1",
					updatedUser!.password
				)
			).toBeTruthy();
		});

		it("숫자를 포함하지 않은 새로운 비밀번호로 변경 실패", async () => {
			const user = await TestUtil.createUser();
			const accessToken = TokenService.generateAccessToken(user.id);

			const response = await request(app)
				.patch("/password")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					oldPassword: user.plainPassword,
					newPassword: "newpassword",
				});

			expect(response.status).toBe(400);
		});
	});

	describe("DELETE /api/users/me", () => {
		it("사용자 삭제", async () => {
			const user = await TestUtil.createUser();
			const accessToken = TokenService.generateAccessToken(user.id);
			const refreshToken = TokenService.generateRefreshToken(user.id);

			const response = await request(app)
				.delete("/me")
				.send({
					access_token: accessToken,
					refresh_token: refreshToken,
				})
				.set("Authorization", `Bearer ${accessToken}`);

			expect(response.status).toBe(204);

			const deletedUser = await prisma.user.findUnique({
				where: { id: user.id, isDeleted: true },
			});
			expect(deletedUser).toBeTruthy();

			// access token이 blacklist에 추가되었는지 확인
			const blockedResponse1 = await request(app)
				.get("/me")
				.set("Authorization", `Bearer ${accessToken}`);
			expect(blockedResponse1.status).toBe(401);

			// refresh token이 blacklist에 추가되었는지 확인
			const blockedResponse2 = await request(app)
				.post("/refresh")
				.send({ refresh_token: refreshToken });
			expect(blockedResponse2.status).toBe(401);
		});
	});
});
