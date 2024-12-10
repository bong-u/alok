import redis from "../redis";

class BlacklistRepository {
	static async isExists(token: string) {
		const value = await redis.get(`blacklist:${token}`);
		return !!value;
	}

	static async add(token: string, expiresIn: number): Promise<void> {
		await redis.set(`blacklist:${token}`, "true", "EX", expiresIn);
	}
}

export default BlacklistRepository;
