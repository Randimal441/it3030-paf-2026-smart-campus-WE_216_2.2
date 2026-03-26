import React from "react";
import { Outlet } from "react-router-dom";
import TechnicianNavbar from "../components/TechnicianNavbar";

export default function TechnicianLayout() {
  return (
    <div>
      <TechnicianNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}