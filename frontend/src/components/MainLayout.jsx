import React from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";

const MainLayout = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <LeftSidebar />
      <div className="flex-1 pt-16 lg:pt-0 lg:ml-[16%]">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
