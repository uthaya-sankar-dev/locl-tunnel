import { Server } from "http";
import WebSocket from "ws";
import { RedisClient } from "../redis";

export const setupWebSocket = async (server: Server) => {
  const wss = new WebSocket.Server({ server });
  console.log("WebSocket server started");
  const redisClient = await RedisClient.getInstance();
  wss.on("connection", (ws, req) => {
    const tunnelId = new URLSearchParams(req.url!.split("?")[1]).get(
      "tunnelId"
    );
    if (!tunnelId) {
      ws.close(1001, "tunnelId is required");
      return;
    }

    const sub = new RedisClient();
    sub.redis.subscribe(`tunnel:${tunnelId}`);
    sub.redis.on("message", (_, message) => {
      ws.send(message);
      ws.once("message", (res) => {
        const data: {
          requestId: string;
        } = JSON.parse(message);
        redisClient.publish(`response:${data.requestId}`, res.toString());
      });
    });

    ws.on("close", () => {
      sub.redis.disconnect();
    });
  });
};
