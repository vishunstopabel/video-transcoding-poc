require("dotenv").config();
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const fs = require("node:fs/promises");
const newfs = require("node:fs");
const ffmpeg = require("fluent-ffmpeg");
const path = require("node:path");
const { io } = require("socket.io-client");
const socket = io(process.env.BACKENDURL);
socket.on("connect", () => {
  console.log(socket.id);
});
let progress = 0;
const client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const BucketName = process.env.ORIGINALVIDEOBUCKETNAME;
const key = process.env.KEY;
const creadentails = key.split("/");
const UploadId = creadentails[2];
const uploderID = creadentails[1];
if (socket.connected) {
  socket.emit("videotranscoding-init", {
    videoId: UploadId,
    uploaderId: uploderID,
    progress: 0,
  });
}
const resolutions = [
  { name: "240p", height: 240, bitrate: 300 },
  { name: "360p", height: 360, bitrate: 800 },
  { name: "480p", height: 480, bitrate: 1400 },
  { name: "720p", height: 720, bitrate: 2500 },
  { name: "1080p", height: 1080, bitrate: 5000 },
  { name: "1440p", height: 1440, bitrate: 8000 },
  { name: "2160p", height: 2160, bitrate: 12000 },
];

async function getOriginalResolution(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const videoStream = metadata.streams.find(
        (s) => s.codec_type === "video"
      );
      resolve({
        width: videoStream.width,
        height: videoStream.height,
        size: videoStream.duration,
      });
    });
  });
}

async function uploadFileToS3(filePath, s3Key) {
  const putCommand = new PutObjectCommand({
    Bucket: process.env.TRANSCODEDVIDEOBUCKETNAME,
    Key: s3Key,
    Body: newfs.createReadStream(filePath),
    ContentType: s3Key.endsWith(".m3u8")
      ? "application/x-mpegURL"
      : "video/MP2T",
  });
  await client.send(putCommand);
  console.log(` Uploaded ${s3Key}`);
}

async function processVideoHLS(originalPath) {
  const { height: originalHeight } = await getOriginalResolution(originalPath);

  const filteredResolutions = resolutions.filter(
    (r) => r.height <= originalHeight
  );
  const masterPlaylistLines = [];

  let processedCount = 0;
  const totalCount = filteredResolutions.length;

  const hlsPromises = filteredResolutions.map((res) => {
    return new Promise((resolve) => {
      const outputDir = path.resolve(`output-${res.name}`);
      const playlistName = `playlist-${res.name}.m3u8`;

      fs.mkdir(outputDir, { recursive: true }).then(() => {
        ffmpeg(originalPath)
          .videoFilter(`scale=-2:${res.height}`)
          .videoBitrate(res.bitrate)
          .audioBitrate("128k")
          .outputOptions([
            "-preset",
            "veryfast",
            "-g",
            "48",
            "-sc_threshold",
            "0",
            "-hls_time",
            "4",
            "-hls_playlist_type",
            "vod",
            "-hls_segment_filename",
            `${outputDir}/segment-%03d.ts`,
          ])
          .output(`${outputDir}/${playlistName}`)
          .on("end", async () => {
            const files = await fs.readdir(outputDir);
            for (const file of files) {
              await uploadFileToS3(
                path.join(outputDir, file),
                `${key}/${res.name}/${file}`
              );
            }

            masterPlaylistLines.push(
              `#EXT-X-STREAM-INF:BANDWIDTH=${res.bitrate * 1000},RESOLUTION=${
                (res.height * 16) / 9
              }x${res.height}\n${res.name}/${playlistName}`
            );
            processedCount += 1;
            progress = Math.floor((processedCount / totalCount) * 100);
            console.log(` HLS for ${res.name} done`);
            console.log(`Progress: ${progress}%`);

            socket.emit("transcoding-progress", {
              videoId: UploadId,
              uploaderId: uploderID,
              progress: progress,
            });

            resolve();
          })
          .on("error", (err) => {
            console.error(` Error processing ${res.name}:`, err);
            resolve();
          })
          .run();
      });
    });
  });

  await Promise.all(hlsPromises);

  // Master playlist creation
  const masterPlaylist = `#EXTM3U\n${masterPlaylistLines.join("\n")}`;
  const masterPath = path.resolve("master.m3u8");
  await fs.writeFile(masterPath, masterPlaylist);
  await uploadFileToS3(masterPath, `${key}/master.m3u8`);
}
async function init() {
  try {
    const command = new GetObjectCommand({
      Bucket: BucketName,
      Key: key,
    });
    const uplodedvidoe = await client.send(command);
    const originalFile = `original.mp4`;
    await fs.writeFile(originalFile, uplodedvidoe.Body);
    console.log(" File downloaded from S3");
    const originalPath = path.resolve(originalFile);
    await processVideoHLS(originalPath);
    console.log(" Adaptive HLS streaming setup complete");

    if (socket.connected) {
      socket.emit("videotranscoding-done", {
        videoId: UploadId,
        uploaderId: uploderID,
        progress: 100,
      });
    }
    socket.disconnect();
  } catch (error) {
    console.error(" Error:", error);
    
    if (socket.connected) {
      socket.emit("videotranscoding-fail", {
        videoId: UploadId,
        uploaderId: uploderID,
        progress: 100,
      });
    }
    socket.disconnect();
  }
}

init();
