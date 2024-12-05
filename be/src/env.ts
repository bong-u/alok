if (!process.env.NODE_ENV) {
	console.error("NODE_ENV is not set");
	process.exit(1);
}

import dotenv from "dotenv";
if (process.env.NODE_ENV === "test") {
	dotenv.config({ path: ".env.test" });
} else {
	dotenv.config();
}
