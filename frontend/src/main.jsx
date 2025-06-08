import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { Provider } from "react-redux";
import { store } from "./store/store";
import GithubCallback from "./components/mycomponents/GithubCallback";
import UploadPage from "./components/mycomponents/UploadPage";
import Yourvideos from "./components/mycomponents/Yourvideos";
import { ThemeProvider } from "@/components/ui/theme-provider";
import VideoInfo from "./components/mycomponents/VideoInfo";
const route = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route>
        <Route element={<App />} path="/">
          <Route element={<UploadPage />} path="/upload" />
          <Route element={<Yourvideos />} path="/my-videos" />
          <Route element={<VideoInfo />} path="/my-videos/:videoId" />
        </Route>
        <Route element={<GithubCallback />} path="/githubauth/callback" />
      </Route>
    </>
  )
);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <RouterProvider router={route} />
        <Toaster />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
