import { Building2, User, Briefcase, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

// interface SidebarProps {
//   activeTab: string;
//   onTabChange: (tab: string) => void;
// }

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.split("/")[2];

  const roleFromPath = location.pathname.startsWith("/candidate")
    ? "candidate"
    : location.pathname.startsWith("/company")
    ? "company"
    : null;

  console.log("Active Tab:", activeTab);

  const companyTabs = [
    { id: "overview", label: "Console", icon: Building2 },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    {
      id: "commondashboard",
      label: "Review Queue",
      icon: Building2,
    },
    { id: "profile", label: "Organization", icon: User },
  ];

  const candidateTabs = [
    { id: "overview", label: "Workspace", icon: User },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    {
      id: "commondashboard",
      label: "Submissions",
      icon: Building2,
    },
    { id: "profile", label: "My Profile", icon: User },
  ];

  const tabs = roleFromPath === "candidate" ? candidateTabs : companyTabs;

  // Helper to get base route
  const getBaseRoute = () => {
    if (roleFromPath === "candidate") return "/candidate";
    return "/company";
  };

  const handleTabClick = (tabId: string) => {
    const baseRoute = getBaseRoute();
    if (tabId === "overview") navigate(`${baseRoute}`);
    else navigate(`${baseRoute}/${tabId}`);
  };

  const logoutClick = async () => {
    // Auth removed
    navigate("/");
  };

  const workspaceLabel =
    roleFromPath === "candidate"
      ? "Student Workspace"
      : roleFromPath === "company"
      ? "Recruiter Console"
      : "Workspace";

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">VeriTrust</h1>
            <p className="text-sm text-gray-500">{workspaceLabel}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            (activeTab === undefined && tab.id === "overview") || activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-blue-700" : "text-gray-500"}`} />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logoutClick}
          className="w-full flex items-center space-x-3 px-4 py-2.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>
    </div>
  );
};
