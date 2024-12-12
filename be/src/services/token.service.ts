import jwt from "jsonwebtoken";
import jwtUtil from "../utils/jwt.util";
import { InvalidTokenError, TokenBlacklistedError } from "../exceptions";
import BlacklistRepository from "../repositories/blacklist.repository";

class TokenService {
	static generateAccessToken(userId: number): string {
		return jwtUtil.generateAccessToken(userId);
	}

	static generateRefreshToken(userId: number): string {
		const refreshToken = jwtUtil.generateRefreshToken(userId);
		return refreshToken;
	}

	static async getUserIdFromToken(token: string): Promise<number> {
		// 토큰이 블랙리스트에 있는지 확인
		if (await BlacklistRepository.isExists(token))
			throw new TokenBlacklistedError();

		return await jwtUtil.getUserIdFromToken(token);
	}

	static async addToBlacklist(token: string): Promise<void> {
		const decoded = jwt.decode(token) as { exp?: number } | null;

		if (!decoded || !decoded.exp) throw new InvalidTokenError();

		const now = Math.floor(Date.now() / 1000);
		const expiresIn = decoded.exp - now;

		if (expiresIn > 0) {
			// 만료 시간만큼 블랙리스트에 추가
			await BlacklistRepository.add(token, expiresIn);
		}
	}
}

export default TokenService;
