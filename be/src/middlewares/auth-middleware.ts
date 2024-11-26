import TokenService from "../services/token-service";

const authMiddleware = async (req: any, res: any, next: any) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).send({
			ok: false,
			message: "Authorization header missing",
		});
	}

	const token = authHeader.split("Bearer ")[1];
	try {
		req.userId = await TokenService.getUserIdFromToken(token);
		next();
	} catch (error) {
		res.status(401).send({
			message: "Invalid token",
		});
	}
};

export default authMiddleware;
