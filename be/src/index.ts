import "./env";
import express from "express";
import cors from "cors";
import recordRouter from "./routers/record-router";
import userRouter from "./routers/user-router";
import attendeeRouter from "./routers/attendee-router";
import authMiddleware from "./middlewares/auth-middleware";
import morgan from "morgan";
const app = express();

const PORT = 3001;

if (process.env.NODE_ENV === "prod") {
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
app.use("/api/users", userRouter());
app.use("/api/records", authMiddleware, recordRouter());
app.use("/api/attendees", authMiddleware, attendeeRouter());

app.listen(PORT, () => {
	console.log(
		`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`
	);
});
