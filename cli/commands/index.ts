import { WebSocket } from "ws";
import { Constants } from "../helpers/constants";
import { ReqPayload } from "../utils/common";
import { forwardRequest } from "../apiConfig";

export const startCommand = (port: number) => {
  const tunnelId =
    process.env.TUNNEL_ID || Math.random().toString(36).substring(2);
  const socket = new WebSocket(
    `${Constants.TUNNEL_SERVER_URL}?tunnelId=${tunnelId}`
  );

  socket.on("open", () => {
    console.log("[Locl] connected to tunnel server");
    console.log(
      `Tunnel server connected: ${Constants.TUNNEL_SERVER_URL.replace(
        "ws",
        "http"
      )}/${tunnelId}`
    );
  });

  socket.on("message", async (data) => {
    const msg: ReqPayload = JSON.parse(data.toString());
    try {
      const res = await forwardRequest(msg, port, tunnelId);
      socket.send(JSON.stringify({ requestId: msg.requestId, ...res }));
    } catch (err: any) {
      console.error(err);
      socket.send(JSON.stringify({ error: err.message }));
    }
  });

  process.on("SIGINT", () => {
    console.log(`Closing socket of tunnel ${tunnelId}`);
    socket.close();
  });
};
