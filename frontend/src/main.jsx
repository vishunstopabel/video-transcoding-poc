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
const route = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route>
        <Route element={<App />} path="/" />
        <Route element={<GithubCallback />} path="/githubauth/callback" />
      </Route>
    </>
  )
);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={route} />
      <Toaster />
    </Provider>
  </StrictMode>
);
