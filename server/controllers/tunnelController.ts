import { Request, Response } from "express";
import { RedisClient } from "../redis";

const pending: Map<string, (data: any) => void> = new Map();

export async function tunnelController(req: Request, res: Response) {
  const tunnelId = req.params.tunnelId;
  const requestId = Math.random().toString(36).substring(2);
  console.log("tunnelId", tunnelId);
  if (!tunnelId) {
    res.status(400).send("tunnelId is required");
    return;
  }

  const reqPayload = {
    requestId,
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    body: req.body,
  };

  const redisClient = await RedisClient.getInstance();
  await redisClient.publish(`tunnel:${tunnelId}`, JSON.stringify(reqPayload));

  const timeout = setTimeout(() => {
    if (pending.has(requestId)) {
      pending.get(requestId)!({
        status: 504,
        headers: {},
        body: "Gateway Timeout",
      });
      pending.delete(requestId);
    }
  }, 30000);

  pending.set(requestId, (data) => {
    clearTimeout(timeout);
    res.status(data.status).set(data.headers).send(data.body);
    pending.delete(requestId);
  });

  const sub = new RedisClient();
  await sub.redis.subscribe(`response:${requestId}`);
  sub.redis.on("message", (_, message) => {
    const data = JSON.parse(message);
    console.log("data", data);
    const handler = pending.get(requestId);
    if (handler) {
      handler(data);
    }
    sub.redis.disconnect();
  });
}
