import { Building2, User, Briefcase, Bot, LogOut, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";

// interface SidebarProps {
//   activeTab: string;
//   onTabChange: (tab: string) => void;
// }

export const Sidebar: React.FC = () => {
  const { user, logout } = usePrivy();
  const navigate = useNavigate();
  const activeTab = useLocation().pathname.split("/")[2];
  console.log("Active Tab:", activeTab);

  const companyTabs = [
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    // { id: "applications", label: "Applications", icon: FileText },
    {
      id: "commondashboard",
      label: "Common Dashboard",
      icon: Building2,
    },
    { id: "ai-search", label: "AI Search", icon: Search },
    { id: "profile", label: "Profile", icon: User },
  ];

  const candidateTabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "jobs", label: "Find Jobs", icon: Briefcase },
    // { id: "applications", label: "My Applications", icon: FileText },
    {
      id: "commondashboard",
      label: "Common Dashboard",
      icon: Building2,
    },
    { id: "ai-agent", label: "AI Agent", icon: Bot },
    { id: "profile", label: "Profile", icon: User },
  ];

  const tabs =
    user?.customMetadata?.role === "candidate" ? candidateTabs : companyTabs;

  // Helper to get base route
  const getBaseRoute = () => {
    if (user && user.customMetadata && user.customMetadata.role === "candidate")
      return "/candidate";
    else return "/company";
  };

  const handleTabClick = (tabId: string) => {
    const baseRoute = getBaseRoute();
    if (tabId === "overview") navigate(`${baseRoute}`);
    else navigate(`${baseRoute}/${tabId}`);
  };

  const logoutClick = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">JobAI</h1>
            <p className="text-sm text-gray-500 capitalize">
              {(user && user.customMetadata && user.customMetadata.role) ||
                "User"}{" "}
              Portal
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                (activeTab === undefined && tab.id === "overview") ||
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium"></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user && user.google && user.google.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user && user.google && user.google.email}
            </p>
          </div>
        </div>

        <button
          onClick={logoutClick}
          className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};
