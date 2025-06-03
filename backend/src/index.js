const express = require("express");
const app = express();
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
const { config } = require("dotenv");
const cors = require("cors");
config({});
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, 
  })
);
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.get("/", async (req, res) => res.send("server is on "));
io.on("connection", (socket) => {
  console.log("new Socket is connected", socket.id);
});
const authRouter = require("../src/routes/auth.routes");
app.use("/api/v1/auth", authRouter);
const port = process.env.BACKEND_PORT || 8000;
httpServer.listen(port, () => {
  console.log(`app is listening at the port:  ${port}`);
});
