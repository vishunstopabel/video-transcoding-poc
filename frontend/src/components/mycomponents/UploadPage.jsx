import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const videos = [
  {
    id: 1,
    title: "Build a Full Stack App",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    uploader: "CodeWithMo",
    videoUploaded: true,
    status: "Processing",
    estimatedTimeToTranscode: "4:00",
  },
  {
    id: 2,
    title: "React + Tailwind Crash Course",
    thumbnail: "https://img.youtube.com/vi/tgbNymZ7vqY/hqdefault.jpg",
    uploader: "Mo Dev",
    videoUploaded: false,
    status: "",
    estimatedTimeToTranscode: "",
  },
];

export default function UploadPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="border rounded-2xl p-6 w-full space-y-6">
        {/* Header */}
        <h1 className="text-xl font-semibold">Pending Videos</h1>

        {/* Video Cards */}
        <div className="flex flex-wrap gap-4">
          {videos.map((video) => (
            <Card key={video.id} className="w-[320px] rounded-xl">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-[180px] object-cover rounded-t-xl"
              />
              <CardContent className="p-4 space-y-1">
                <p className="text-sm font-medium">{video.title}</p>
                <p className="text-xs text-muted-foreground">
                  By {video.uploader}
                </p>
                {video.videoUploaded ? (
                  <>
                    <p className="text-xs">
                      Status:{" "}
                      <span className="font-medium">{video.status}</span>
                    </p>
                    <p className="text-xs">
                      ETA:{" "}
                      <span className="font-medium">
                        {video.estimatedTimeToTranscode}
                      </span>
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-destructive">Video not uploaded</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Upload Button */}
        <div className="flex justify-center">
          <Button
            className="px-6 py-2 rounded-full text-base"
            onClick={() => navigate("/upload/video")}
          >
            Upload New Video
          </Button>
        </div>
      </div>
    </div>
  );
}
