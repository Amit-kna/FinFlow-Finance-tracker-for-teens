"use client";

import { useNavigation } from "./NavigationProvider";
import Sidebar from "./Sidebar";

export default function SidebarWrapper() {
  const { isSidebarOpen, closeSidebar } = useNavigation();

  return <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />;
}