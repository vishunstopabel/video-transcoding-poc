import React from "react";
import { Outlet } from "react-router";
import ContinueWithGithubButton from "./components/mycomponents/ContinueWithGithubButton";
import Navbar from "./components/mycomponents/Navbar";

function App() {
  return (
    <div>
      <Navbar />
      <div className="pt-15">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
