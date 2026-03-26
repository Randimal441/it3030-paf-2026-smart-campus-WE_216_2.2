import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";

export default function AdminLayout() {
  return (
    <div>
      <AdminNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}