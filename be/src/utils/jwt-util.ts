import jwt from "jsonwebtoken";
import crypto from "crypto";

const secret = "secret";
const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION || "1m";
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPITION || "7d";

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
					return reject(err);
				}
				if (
					decoded &&
					typeof decoded === "object" &&
					"userId" in decoded &&
					typeof decoded.userId === "number"
				) {
					resolve(decoded.userId as any as number);
				}
				reject(new Error("Invalid token payload"));
			});
		});
	},
};

export default JwtUtil;
