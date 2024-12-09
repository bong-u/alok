import Redis from "ioredis";

const redis = new Redis({
	host: process.env.REDIS_HOST,
	port: Number(process.env.REDIS_PORT),
	password: process.env.REDIS_PASSWORD || "",
	db: process.env.NODE_ENV === "test" ? 1 : 0, // 테스트 환경이면 DB 1번, 아니면 DB 0번
});

export default redis;
