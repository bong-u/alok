import { Router, Request, Response } from "express";
import UserService from "../services/user-service";
import authMiddleware from "../middlewares/auth-middleware";
import validationMiddleware from "../middlewares/validation-middleware";
import {
	loginSchema,
	refreshTokenSchema,
	terminateTokenSchema,
	passwordChangeSchema,
	signupSchema,
} from "../schemas/user-schemas";
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

	router.get("/me", authMiddleware, async (req: Request, res: Response) => {
		const userId = req.userId;
		try {
			const user = await UserService.getUserById(userId);
			return res
				.status(200)
				.json({ id: userId, username: user.username });
		} catch (err: unknown) {
			if (err instanceof UserNotFoundError)
				return res.status(404).send(err.message);

			console.error(err);
			return res.status(500).send((err as Error).message);
		}
	});

	router.get("/all", authMiddleware, async (_: Request, res: Response) => {
		try {
			const users = await UserService.getAllUsers();
			return res.status(200).json(users);
		} catch (err: unknown) {
			console.error(err);
			return res.status(500).send((err as Error).message);
		}
	});

	router.post(
		"/login",
		validationMiddleware(loginSchema),
		async (req: Request, res: Response) => {
			const { username, password } = req.body;
			try {
				const tokenResponse = await UserService.authenticateByUsername(
					username,
					password
				);
				return res.status(200).json({
					access_token: tokenResponse.accessToken,
					refresh_token: tokenResponse.refreshToken,
				});
			} catch (err: unknown) {
				if (err instanceof UserAuthenticationFailedError)
					return res.status(401).send(err.message);

				console.error(err);
				return res.status(500).send((err as Error).message);
			}
		}
	);

	router.post(
		"/signup",
		validationMiddleware(signupSchema),
		async (req: Request, res: Response) => {
			const { username, password, recaptchaToken } = req.body;

			try {
				await UserService.userSignup(
					username,
					password,
					recaptchaToken
				);
				return res.status(201).send("User created successfully");
			} catch (err: unknown) {
				if (err instanceof RecaptchaScoreTooLowError)
					return res.status(403).send(err.message);
				if (err instanceof RecaptchaTokenInvalidError)
					return res.status(400).send(err.message);
				if (err instanceof UserAlreadyExistsError)
					return res.status(409).send(err.message);

				console.error(err);
				return res.status(500).send((err as Error).message);
			}
		}
	);

	router.post(
		"/logout",
		validationMiddleware(terminateTokenSchema),
		async (req: Request, res: Response) => {
			const accessToken = req.body.access_token;
			const refreshToken = req.body.refresh_token;
			try {
				UserService.addTokensToBlacklist(accessToken, refreshToken);
				return res.status(204).send();
			} catch (err: unknown) {
				if (
					err instanceof InvalidTokenError ||
					err instanceof TokenBlacklistedError
				)
					return res.status(401).send(err.message);

				console.error(err);
				return res.status(500).send((err as Error).message);
			}
		}
	);

	router.post(
		"/refresh",
		validationMiddleware(refreshTokenSchema),
		async (req: Request, res: Response) => {
			const { refresh_token: refreshToken } = req.body;
			try {
				const accessToken =
					await UserService.refreshToken(refreshToken);

				return res.status(200).json({
					access_token: accessToken,
				});
			} catch (err: unknown) {
				if (
					err instanceof InvalidTokenError ||
					err instanceof TokenBlacklistedError
				)
					return res.status(401).send(err.message);

				console.error(err);
				return res.status(500).send((err as Error).message);
			}
		}
	);

	router.patch(
		"/password",
		validationMiddleware(passwordChangeSchema),
		authMiddleware,
		async (req: Request, res: Response) => {
			const userId = req.userId;
			const { old_password: oldPassword, new_password: newPassword } =
				req.body;

			try {
				await UserService.changePassword(
					userId,
					oldPassword,
					newPassword
				);
				return res.status(204).send();
			} catch (err: unknown) {
				if (err instanceof UserAuthenticationFailedError)
					return res.status(404).send(err.message);
				console.error(err);
				return res.status(500).send((err as Error).message);
			}
		}
	);

	router.delete(
		"/me",
		authMiddleware,
		validationMiddleware(terminateTokenSchema),
		async (req: Request, res: Response) => {
			const userId = req.userId;
			const { access_token: accessToken, refresh_token: refreshToken } =
				req.body;

			try {
				await UserService.deleteUser(accessToken, refreshToken, userId);
				return res.status(204).send();
			} catch (err: unknown) {
				if (err instanceof UserNotFoundError)
					return res.status(404).send(err.message);
				if (err instanceof InvalidTokenError)
					return res.status(401).send(err.message);
				console.error(err);
				return res.status(500).send((err as Error).message);
			}
		}
	);

	return router;
};

export default userRouter;
