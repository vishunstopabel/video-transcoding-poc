import React from "react";
import { Button } from "../ui/button";
import axiosInstance from "@/utils/AxiosInstance";

function ContinueWithGithubButton() {
  console.log("hello");
  async function handleInitGithub() {
    try {
      const res = await axiosInstance.get("/auth/github");

      window.location.href = res.data.url;
    } catch (error) {
      console.log("Error in GitHub init:", error);
    }
  }

  return (
    <div>
      <Button onClick={handleInitGithub}>Continue with GitHub</Button>
    </div>
  );
}

export default ContinueWithGithubButton;
