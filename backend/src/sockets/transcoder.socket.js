const { getClient } = require("../config/redisConnet");
const UploadModel = require("../models/upload.model");
const { getIo } = require("./connect.socket");

const io = getIo();
const client = getClient();

io.on("connection", (socket) => {
  socket.on(
    "videotranscoding-init",
    async ({ videoId, uploaderId, progress }) => {
      await UploadModel.findByIdAndUpdate(videoId, {
        status: "processing",
      });
      console.log("videotranscoding-inited");
      const socketIds = await client.smembers(`socket:${uploaderId}`);
      if (!socketIds || socketIds.length === 0) {
        console.log("User is offline.");
        return;
      }
      socketIds.forEach((id) => {
        io.to(id).emit(`transcoding-init-${videoId}`, {
          msg: "Transcoding started",
          progress,
        });
      });
    }
  );

  socket.on(
    "transcoding-progress",
    async ({ videoId, uploaderId, progress }) => {
      const socketIds = await client.smembers(`socket:${uploaderId}`);
      if (!socketIds || socketIds.length === 0) {
        console.log("User is offline.");
        return;
      }
      socketIds.forEach((id) => {
        io.to(id).emit(`transcoding-progress-${videoId}`, {
          videoId,
          uploaderId,
          progress,
        });
      });
    }
  );
  socket.on(
    "videotranscoding-done",
    async ({ videoId, uploaderId, progress }) => {
      await UploadModel.findByIdAndUpdate(videoId, {
        status: "completed",
      });
      console.log("videotranscoding-done");
      const socketIds = await client.smembers(`socket:${uploaderId}`);
      if (!socketIds || socketIds.length === 0) {
        console.log("User is offline.");
        return;
      }
      socketIds.forEach((id) => {
        io.to(id).emit(`transcoding-done-${videoId}`, {
          msg: "Transcoding done",
          progress,
        });
      });
    }
  );

  socket.on("videotranscoding-fail", async ({ videoId, uploaderId }) => {
    await UploadModel.findByIdAndUpdate(videoId, {
      status: "failed",
    });

    console.log("videotranscoding-fail");

    const socketIds = await client.smembers(`socket:${uploaderId}`);
    if (!socketIds || socketIds.length === 0) {
      console.log("User is offline.");
      return;
    }

    socketIds.forEach((id) => {
      io.to(id).emit(`transcoding-fail-${videoId}`, {
        msg: "Transcoding failed",
      });
    });
  });
});
