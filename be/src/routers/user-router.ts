import { Router, Request, Response } from "express";
import UserService from "../services/user-service";
import TokenService from "../services/token-service";
import authMiddleware from "../middlewares/auth-middleware";
import validationMiddleware from "../middlewares/validation-middleware";
import {
	loginSchema,
	refreshTokenSchema,
	terminateTokenSchema,
	passwordChangeSchema,
	signupSchema,
} from "../interfaces/user-interfaces";
import {
	UserNotFoundError,
	UserAuthenticationFailedError,
	UserAlreadyExistsError,
	RecaptchaScoreTooLowError,
	RecaptchaTokenInvalidError,
	TokenBlacklistedError,
	InvalidTokenError,
} from "../exceptions";

const userRouter = () => {
	const router = Router();

	router.get("/me", authMiddleware, async (req: any, res: Response) => {
		const userId = req.userId;
		try {
			const user = await UserService.getUserById(userId);
			res.status(200).json({ id: userId, username: user.username });
		} catch (err: any) {
			if (err instanceof UserNotFoundError) {
				res.status(404).send(err.message);
			} else {
				console.error(err);
				res.status(500).send(err.message);
			}
		}
	});

	router.get("/all", authMiddleware, async (_: any, res: Response) => {
		try {
			const users = await UserService.getAllUsers();
			res.status(200).json(users);
		} catch (err: any) {
			console.error(err);
			res.status(500).send(err.message);
		}
	});

	router.post(
		"/login",
		validationMiddleware(loginSchema),
		async (req: Request, res: Response) => {
			const { username, password } = req.body;
			try {
				const userId = await UserService.authenticateByUsername(
					username,
					password
				);

				res.status(200).json({
					access_token: TokenService.generateAccessToken(userId),
					refresh_token: TokenService.generateRefreshToken(userId),
				});
			} catch (err: any) {
				if (err instanceof UserAuthenticationFailedError) {
					res.status(401).send(err.message);
				} else {
					console.error(err);
					res.status(500).send(err.message);
				}
			}
		}
	);

	router.post(
		"/signup",
		validationMiddleware(signupSchema),
		async (req: Request, res: Response) => {
			const { username, password, recaptchaToken } = req.body;

			try {
				await UserService.verifyRecaptcha(recaptchaToken);
				await UserService.createUser(username, password);
				res.status(201).send("User created successfully");
			} catch (err: any) {
				if (err instanceof RecaptchaScoreTooLowError) {
					res.status(403).send(err.message);
				} else if (err instanceof RecaptchaTokenInvalidError) {
					res.status(400).send(err.message);
				} else if (err instanceof UserAlreadyExistsError) {
					res.status(409).send(err.message);
				} else {
					console.error(err);
					res.status(500).send(err.message);
				}
			}
		}
	);

	router.post(
		"/logout",
		validationMiddleware(terminateTokenSchema),
		async (req: Request, res: Response) => {
			const { access_token, refresh_token } = req.body;
			try {
				await TokenService.addToBlacklist(access_token);
				await TokenService.addToBlacklist(refresh_token);
				res.status(204).send();
			} catch (err: any) {
				if (
					err instanceof InvalidTokenError ||
					err instanceof TokenBlacklistedError
				) {
					res.status(401).send(err.message);
				} else {
					console.error(err);
					res.status(500).send(err.message);
				}
			}
		}
	);

	router.post(
		"/refresh",
		validationMiddleware(refreshTokenSchema),
		async (req: Request, res: Response) => {
			const { refresh_token: refreshToken } = req.body;
			try {
				const userId =
					await TokenService.getUserIdFromToken(refreshToken);

				res.status(200).json({
					access_token:
						await TokenService.generateAccessToken(userId),
				});
			} catch (err: any) {
				if (
					err instanceof InvalidTokenError ||
					err instanceof TokenBlacklistedError
				) {
					res.status(401).send(err.message);
				} else {
					console.error(err);
					res.status(500).send(err.message);
				}
			}
		}
	);

	router.patch(
		"/password",
		validationMiddleware(passwordChangeSchema),
		authMiddleware,
		async (req: any, res: Response) => {
			const userId = req.userId;
			const { old_password: oldPassword, new_password: newPassword } =
				req.body;

			try {
				await UserService.authenticateById(userId, oldPassword);
				await UserService.changePassword(userId, newPassword);
				res.status(204).send();
			} catch (err: any) {
				console.error(err);
				res.status(500).send(err.message);
			}
		}
	);

	router.delete(
		"/me",
		authMiddleware,
		validationMiddleware(terminateTokenSchema),
		async (req: any, res: Response) => {
			const userId = req.userId;
			const { access_token: acessToken, refresh_token: refreshToken } =
				req.body;

			try {
				await UserService.getUserById(userId);
				await TokenService.addToBlacklist(acessToken);
				await TokenService.addToBlacklist(refreshToken);
				await UserService.deleteUser(userId);
				res.status(204).send();
			} catch (err: any) {
				if (err instanceof UserNotFoundError) {
					res.status(404).send(err.message);
				} else if (err instanceof InvalidTokenError) {
					res.status(401).send(err.message);
				} else {
					console.error(err);
					res.status(500).send(err.message);
				}
			}
		}
	);

	return router;
};

export default userRouter;
