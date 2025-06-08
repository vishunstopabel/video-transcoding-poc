import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axiosInstance from "@/utils/AxiosInstance";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { Progress } from "../ui/progress";

function VideoInfo() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("processing");
  const [progress, setProgress] = useState(0);
  const [filename, setFilename] = useState("");
  useEffect(() => {
    const fetchVideoInfo = async () => {
      try {
        const response = await axiosInstance.get(
          `/view/get-video-by-id/${videoId}`
        );
        if (!response.data.isVideoUploaded) {
          navigate(`/upload?videoId=${response.data._id}`);
          return;
        }
        setVideo(response.data);
      } catch (err) {
        setError("Failed to load video details.");
        console.error("Error fetching video info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideoInfo();
  }, [videoId, navigate]);


  


  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-6 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500 font-semibold">{error}</div>;
  }

  return (
    <div className="p-6 md:p-10">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column: Video + Thumbnail */}
        <div className="space-y-4">
          <Card className="aspect-video bg-black text-white flex items-center justify-center">
            <CardContent className="p-4 flex items-center justify-center h-full">
              {video.status === "completed" ? (
                <video
                  controls
                  className="rounded-lg w-full h-full object-cover"
                  src={video.transcodedVideoKey}
                />
              ) : (
                <span>Video processing...</span>
              )}
            </CardContent>
          </Card>

          <Separator />

          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <AspectRatio ratio={712 / 401}>
                  <img
                    src={video.thumbnailKey}
                    alt={video.title}
                    className="object-cover w-full h-full rounded-2xl pl-2 pr-2"
                  />
                </AspectRatio>
              </CardContent>
            </Card>

            <Button variant="outline">Change Thumbnail</Button>
          </div>

         
        </div>

        {/* Right Column: Video Details */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <h2 className="text-xl font-semibold">{video.title}</h2>
              <p className="text-muted-foreground">{video.description}</p>
              <p>
                Status: <span className="font-medium">{video.status}</span>
              </p>
              <p>Public: {video.isPublic ? "Yes" : "No"}</p>
              <p className="text-xs text-muted-foreground">
                Uploaded at: {new Date(video.createdAt).toLocaleString()}
              </p>
                {
                  status==="processing"?(
                    <div className="text-yellow-500">
                      <>
                    <Progress value={progress} className="mt-2" />
                    <span className="text-sm text-gray-500">
                      Video Transcoding Progress: {progress}% [{filename}]
                    </span>
                  </>
                    </div>
                  ):
                 null
                }
            </CardContent>
          </Card>

          <Button>Edit Details</Button>
        </div>
      </div>
    </div>
  );
}

export default VideoInfo;
