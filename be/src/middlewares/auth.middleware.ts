import { Request, Response, NextFunction } from "express";
import TokenService from "../services/token.service";
import { InvalidTokenError, TokenBlacklistedError } from "../exceptions";

const authMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).send({
			ok: false,
			message: "Authorization header missing",
		});
	}

	try {
		const token = String(authHeader.split("Bearer ")[1]);
		req.userId = await TokenService.getUserIdFromToken(token);
		return next();
	} catch (err: unknown) {
		if (
			err instanceof InvalidTokenError ||
			err instanceof TokenBlacklistedError
		) {
			res.status(401).send(err.message);
		} else {
			console.error(err);
			res.status(500).send((err as Error).message);
		}
	}
};

export default authMiddleware;
