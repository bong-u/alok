import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";

const validationMiddleware =
	(schema: ObjectSchema, source: "body" | "params" | "query" = "body") =>
	(req: Request, res: Response, next: NextFunction) => {
		const { error } = schema.validate(req[source]);
		if (error) {
			res.status(400).send(error.details?.[0]?.message);
		} else {
			next();
		}
	};

export default validationMiddleware;
