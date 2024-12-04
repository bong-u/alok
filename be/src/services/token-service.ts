import jwt from "jsonwebtoken";
import jwtUtil from "../utils/jwt-util";
import redis from "../redis";
import { InvalidTokenError, TokenBlacklistedError } from "../exceptions";

class TokenService {
	static generateAccessToken(userId: number): string {
		return jwtUtil.generateAccessToken(userId);
	}

	static generateRefreshToken(userId: number): string {
		const refreshToken = jwtUtil.generateRefreshToken(userId);
		return refreshToken;
	}

	private static async isTokenBlacklisted(token: string): Promise<boolean> {
		return !!(await redis.get(`blacklist:${token}`));
	}

	static async getUserIdFromToken(token: string): Promise<number> {
		if (await this.isTokenBlacklisted(token)) {
			throw new TokenBlacklistedError();
		}
		return await jwtUtil.getUserIdFromToken(token);
	}

	static addToBlacklist(token: string) {
		const decoded = jwt.decode(token) as { exp?: number } | null;

		if (!decoded || !decoded.exp) {
			throw new InvalidTokenError();
		}

		const now = Math.floor(Date.now() / 1000);
		const expiresIn = decoded.exp - now;

		if (expiresIn > 0) {
			// 만료 시간만큼 블랙리스트에 추가
			redis.set(`blacklist:${token}`, "true", "EX", expiresIn);
		}
	}
}

export default TokenService;
