import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardTitle, CardHeader, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import axiosInstance from "@/utils/AxiosInstance";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router";

import { Progress } from "@/components/ui/progress";
function UploadPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const navigate = useNavigate();
  const thumbnailFile = watch("thumbnail");

  useEffect(() => {
    if (thumbnailFile && thumbnailFile[0]) {
      const file = thumbnailFile[0];
      setImageFile(file);
      const previewURL = URL.createObjectURL(file);
      setThumbnailPreview(previewURL);
      return () => URL.revokeObjectURL(previewURL);
    }
  }, [thumbnailFile]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const videoIdFromParams = params.get("videoId");
    if (videoIdFromParams) {
      setVideoId(videoIdFromParams);
    } ///not a proper way. check that video details  via api calling
  }, []);
  const onSubmit = async (data) => {
    console.log("Form data:", data);
    try {
      setIsVideoUploading;
      const response = await axiosInstance.post("/upload/createVideo", {
        title: data.title,
        description: data.description,
        isPublic: data.isPublic === "on" ? true : false,
        ContentType: imageFile ? imageFile.type : "image/jpeg",
      });
      const { signedImageUrl, videoId } = response.data;
      console.log("Received signed URL:", signedImageUrl);
      const uploadimagetotos3 = await axios.put(signedImageUrl, imageFile, {
        headers: {
          "Content-Type": imageFile.type,
        },
      });
      if (uploadimagetotos3.status === 200) {
        console.log("Thumbnail uploaded successfully");
      } else {
        console.error("Failed to upload thumbnail");
      }
      const params = new URLSearchParams(window.location.search);
      params.set("videoId", videoId);
      window.history.pushState({}, "", `${window.location.pathname}?${params}`);
      setVideoId(videoId);
      toast.success(
        "Video details created successfully, please upload the video now."
      );
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    setVideoFile(file);
    console.log("Video file:", file);
  };

  const getsignedUrlforVideo = async () => {
    try {
      const response = await axiosInstance.get(
        `/upload/SignedUrl?uploadId=${videoId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting signed URL:", error);
      throw error;
    }
  };

  const handleUploadVideo = async () => {
    setIsVideoUploading(true);
    setUploadProgress(0);

    try {
      if (!videoFile) {
        toast.error("Please select a video file to upload.");
        throw new Error("No video file selected");
      }
      if (!videoId) {
        toast.error("Video ID is not set. Please create video details first.");
        throw new Error("No video ID found");
      }
      const { url } = await getsignedUrlforVideo();
      console.log("Received signed URL:", url);
      const response = await axios.put(url, videoFile, {
        headers: {
          "Content-Type": videoFile.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload Progress: ${percentCompleted}%`);
          setUploadProgress(percentCompleted);
        },
      });
      if (response.status === 200) {
        console.log("Video uploaded successfully");
        setUploadProgress(100);
        const response = await axiosInstance.put("/upload/updateVideoStatus", {
          videoId: videoId,
        });
        if(response){
          toast.success("Video uploaded successfully");
          navigate(`/my-videos/${videoId}`);
        }
        setIsVideoUploading(false);
        setVideoFile(null); 
      } else {
        setIsVideoUploading(false);
        setUploadProgress(0);
        console.error("Failed to upload video");
        toast.error("Failed to upload video");
      }
    } catch (error) {
      setIsVideoUploading(false);
      setUploadProgress(0);
      console.error("Error uploading video:", error);
      toast.error("Error uploading video");
    }
  };

  return (
    <div className="p-6">
      <Card className="w-full pb-20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-start ml-4">
            Upload Page
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-row gap-4">
          {/* LEFT SIDE */}
          <div className="flex w-3/5 p-4">
            {videoId ? (
              <div>video details created successfully upload video</div>
            ) : (
              <Card className="w-full min-h-[600px]">
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Title */}
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter your video title"
                        {...register("title", { required: true })}
                      />
                      {errors.title && (
                        <p className="text-red-500 text-sm">
                          Title is required
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Write a brief description..."
                        className="min-h-[100px]"
                        {...register("description", { required: true })}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm">
                          Description is required
                        </p>
                      )}
                    </div>

                    {/* Is Public */}
                    <div className="flex items-center space-x-2">
                      <Checkbox id="isPublic" {...register("isPublic")} />
                      <Label htmlFor="isPublic">Make Public</Label>
                    </div>

                    {/* Thumbnail Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="thumbnail">Upload Thumbnail</Label>
                      <Input
                        id="thumbnail"
                        type="file"
                        accept="image/jpeg"
                        {...register("thumbnail", { required: true })}
                      />
                      {thumbnailPreview && (
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail Preview"
                          className="mt-2 rounded-md max-h-40 w-auto object-contain border"
                        />
                      )}
                      {errors.thumbnail && (
                        <p className="text-red-500 text-sm">
                          Thumbnail is required
                        </p>
                      )}
                    </div>

                    <Button type="submit" className="w-full mt-4">
                      Submit
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* SEPARATOR */}
          <div className="w-px bg-gray-200 mx-2" />

          {/* RIGHT SIDE */}
          <div className="flex w-2/5 p-4 justify-center items-center">
            <Card className="w-full h-full p-6 flex items-center justify-center">
              <CardContent className="w-full space-y-4">
                <Label htmlFor="video">Upload Video</Label>
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                />
                <Button
                  className="w-full"
                  disabled={isVideoUploading}
                  onClick={() => handleUploadVideo()}
                >
                  {isVideoUploading ? "Uploading..." : "Upload Video"}
                </Button>
                {isVideoUploading && (
                  <>
                    <Progress value={uploadProgress} className="mt-2" />
                    <span className="text-sm text-gray-500">
                      Upload Progress: {uploadProgress}%
                    </span>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UploadPage;
