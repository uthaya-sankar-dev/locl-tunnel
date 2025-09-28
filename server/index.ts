import express from "express";
import http from "http";
import { setupWebSocket } from "./sockets";
import { tunnelRouter } from "./routes/tunnel/tunnel";

const app = express();

app.use(express.json());
app.use("/:tunnelId", tunnelRouter);
app.use((req, res) => {
  console.log("404 Route not matched:", req.method, req.originalUrl);
  res.status(404).send("Not Found");
});

const port = process.env.PORT || 8080;

const server = http.createServer(app);
setupWebSocket(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
