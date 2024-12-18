import jwt from "jsonwebtoken";
import crypto from "crypto";
import { InvalidTokenError } from "../exceptions";

const secret = "secret";
const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION || "1m";
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPITION || "7d";

interface JwtPayload {
	userId: number;
}

const JwtUtil = {
	generateAccessToken: (userId: number) => {
		const payload = { userId };
		return jwt.sign(payload, secret, {
			algorithm: "HS256",
			expiresIn: ACCESS_TOKEN_EXPIRATION,
		});
	},

	generateRefreshToken: (userId: number) => {
		const payload = {
			userId,
			nonce: crypto.randomBytes(16).toString("hex"),
		};
		return jwt.sign(payload, secret, {
			algorithm: "HS256",
			expiresIn: REFRESH_TOKEN_EXPIRATION,
		});
	},

	getUserIdFromToken: (token: string): Promise<number> => {
		return new Promise((resolve, reject) => {
			jwt.verify(token, secret, (err, decoded) => {
				if (err) {
					return reject(new InvalidTokenError());
				}
				if (
					decoded &&
					typeof decoded === "object" &&
					"userId" in decoded &&
					typeof decoded.userId === "number"
				) {
					resolve((decoded as JwtPayload).userId);
				}
				reject(new InvalidTokenError());
			});
		});
	},
};

export default JwtUtil;
