import React from "react";
import { useSelector } from "react-redux";
import { LogOut, Upload, Video } from "lucide-react";
import ContinueWithGithubButton from "./ContinueWithGithubButton";
import useLogout from "@/hooks/UseLogout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

function Navbar() {
  const logout = useLogout();
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector((state) => state.auth);

  const authenticatedItems = [
    {
      name: "Upload Videos",
      icon: <Upload className="w-5 h-5" />,
      onClick: () => navigate("/upload"),
    },
    {
      name: "Your Videos",
      icon: <Video className="w-5 h-5" />,
      onClick: () => navigate("/my-videos"),
    },
    {
      name: "Logout",
      icon: <LogOut className="w-5 h-5" />,
      onClick: logout,
    },
  ];

  return (
    <nav className="w-full px-6 py-3 bg-white border-b shadow-sm flex justify-between items-center">
      <div className="text-xl font-bold text-black">MyTube</div>

      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          {authenticatedItems.map((item) => (
            <Button
              key={item.name}
              variant="outline"
              className="flex items-center gap-2"
              onClick={item.onClick}
            >
              {item.icon}
              <span className="text-sm">{item.name}</span>
            </Button>
          ))}
        </div>
      ) : (
        <ContinueWithGithubButton />
      )}
    </nav>
  );
}

export default Navbar;
