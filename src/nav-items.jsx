import { Home, LayoutDashboard, CheckSquare, User, Database } from "lucide-react";
import Index from "./pages/Index.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tasks from "./pages/Tasks.jsx";
import Profile from "./pages/Profile.jsx";
import KnowledgeBase from "./pages/KnowledgeBase.jsx";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Tasks",
    to: "/tasks",
    icon: <CheckSquare className="h-4 w-4" />,
    page: <Tasks />,
  },
  {
    title: "Profile",
    to: "/profile",
    icon: <User className="h-4 w-4" />,
    page: <Profile />,
  },
  {
    title: "Knowledge Base",
    to: "/knowledge-base",
    icon: <Database className="h-4 w-4" />,
    page: <KnowledgeBase />,
  },
];
