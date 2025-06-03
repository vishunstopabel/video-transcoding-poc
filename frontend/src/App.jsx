import React from "react";
import { Outlet } from "react-router";
import ContinueWithGithubButton from "./components/mycomponents/ContinueWithGithubButton";

function App() {
  return (
    <div>
      <Outlet />
      <ContinueWithGithubButton />
    </div>
  );
}

export default App;
