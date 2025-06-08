const express = require("express");
const app = express();

const { createServer } = require("http");

const httpServer = createServer(app);
const { ConnectToRedis } = require("./config/redisConnet");
const { SocketIo } = require("./sockets/connect.socket");
const { config } = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
config({});
 const initConnections=async ()=>{
  await  ConnectToRedis();
   await connectToDB();
     await SocketIo(httpServer);
 } 
initConnections()

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
app.use(cookieParser());
app.get("/", async (req, res) => res.send("server is on "));
const authRouter = require("../src/routes/auth.routes");
const uploadRouter = require("../src/routes/upload.routes");
const connectToDB = require("./config/monoDbConnect");
const viewRouter = require("./routes/view.routes");
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/view", viewRouter);
const port = process.env.BACKEND_PORT || 8000;
httpServer.listen(port, () => {
  console.log(`app is listening at the port:  ${port}`);
 
});
