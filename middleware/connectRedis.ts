import Valkey from "ioredis";

const redisConfig = {
    host: process.env.REDIS_HOST || "",
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD || '',
    tls: {}
};

const setConnectionRedis = () => {
    const result = new Valkey(redisConfig);
    return result;
}

export default setConnectionRedis;