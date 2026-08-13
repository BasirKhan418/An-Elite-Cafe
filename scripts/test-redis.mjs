import Redis from "ioredis";

const url = process.env.REDIS_URL;

if (!url) {
  console.error("Missing REDIS_URL in .env");
  process.exit(1);
}

const redis = new Redis(url, {
  maxRetriesPerRequest: 3,
  connectTimeout: 15000,
});

try {
  const pong = await redis.ping();
  await redis.set("ccc:healthcheck", "ok", "EX", 30);
  const value = await redis.get("ccc:healthcheck");
  await redis.del("ccc:healthcheck");

  console.log(`PING: ${pong}`);
  console.log(`SET/GET: ${value}`);
  console.log("Redis connection OK");
  await redis.quit();
  process.exit(0);
} catch (error) {
  console.error("Redis connection failed:", error);
  redis.disconnect();
  process.exit(1);
}
