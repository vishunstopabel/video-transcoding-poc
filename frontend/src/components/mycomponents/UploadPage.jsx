import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardTitle, CardHeader, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

function UploadPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const thumbnailFile = watch("thumbnail");

  // Set thumbnail preview
  React.useEffect(() => {
    if (thumbnailFile && thumbnailFile[0]) {
      const file = thumbnailFile[0];
      const previewURL = URL.createObjectURL(file);
      setThumbnailPreview(previewURL);

      // Cleanup on unmount
      return () => URL.revokeObjectURL(previewURL);
    }
  }, [thumbnailFile]);

  const onSubmit = (data) => {
    console.log("Form Data:", data);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    console.log("Video file:", file);
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
                      <p className="text-red-500 text-sm">Title is required</p>
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
                      accept="image/*"
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
                  onClick={() => console.log("Upload triggered")}
                >
                  Upload Video
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UploadPage;
