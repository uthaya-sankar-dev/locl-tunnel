import Redis, { RedisOptions } from "ioredis";

export class RedisClient {
  private static instance: RedisClient;
  public redis: Redis;
  private isReady: boolean = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    const redisTLS = process.env.REDIS_TLS === "true";
    const username = process.env.REDIS_USERNAME;
    const password = process.env.REDIS_PASSWORD;

    const redisOptions: RedisOptions = {
      ...(redisTLS && {
        tls: {},
      }),
    };

    if (username && password) {
      redisOptions.username = username;
      redisOptions.password = password;
    }

    this.redis = new Redis(redisUrl, redisOptions);
    this.redis.on("connect", () => {
      this.isReady = true;
    });
    this.redis.on("error", (err) => {
      console.error("Redis connection error:", err);
    });
  }

  public static async getInstance(): Promise<RedisClient> {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    await RedisClient.instance.ensureConnection();
    return RedisClient.instance;
  }

  private async ensureConnection() {
    return new Promise((resolve, reject) => {
      if (this.isReady) {
        console.log("Redis connection established");
        resolve(true);
      } else {
        this.redis.on("connect", () => {
          this.isReady = true;
          resolve(false);
        });
        this.redis.on("error", (err) => {
          reject();
        });
      }
    });
  }

  async publish(channel: string, message: string) {
    await this.redis.publish(channel, message);
  }
}
