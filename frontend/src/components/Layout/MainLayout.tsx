import { Outlet } from "react-router-dom";
import { Sidebar } from "../ui/Sidebar";

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto p-10">
        <Outlet />
      </div>
    </div>
  );
}
