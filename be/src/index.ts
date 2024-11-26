import express from "express";
import cors from "cors";
import recordRouter from "./routers/record-router";
import userRouter from "./routers/user-router";
import authMiddleware from "./middlewares/auth-middleware";
import morgan from "morgan";

const app = express();

const ENV = process.env.NODE_ENV || "dev";
const PORT = 3001;

if (ENV === "prod") {
	app.use(morgan("combined"));
} else {
	app.use(morgan("dev"));
}

app.use(
	cors({
		origin: "http://193.122.103.176:8081",
	})
);
app.use(express.json());
app.use("/api/records", authMiddleware, recordRouter());
app.use("/api/users", userRouter());

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT} in ${ENV} mode`);
});
