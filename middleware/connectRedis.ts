import Valkey from "ioredis";

let redisClient: Valkey | null = null;

const setConnectionRedis = () => {
    if (redisClient) {
        return redisClient;
    }

    const url = process.env.REDIS_URL;

    redisClient = url
        ? new Valkey(url, {
            maxRetriesPerRequest: 3,
            connectTimeout: 15000,
        })
        : new Valkey({
            host: process.env.REDIS_HOST || "",
            port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
            username: process.env.REDIS_USERNAME || "default",
            password: process.env.REDIS_PASSWORD || "",
            tls: {},
            maxRetriesPerRequest: 3,
            connectTimeout: 15000,
        });

    redisClient.on("error", (err) => {
        console.error("Redis connection error:", err);
    });

    redisClient.on("connect", () => {
        console.log("Connected to Redis");
    });

    return redisClient;
};

export default setConnectionRedis;
