import { Building2, User, Briefcase, LogOut, Wallet, ShieldCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGlobalContext } from "../../Context/useGlobalContext";

// interface SidebarProps {
//   activeTab: string;
//   onTabChange: (tab: string) => void;
// }

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { connectWallet, walletAddress } = useGlobalContext();
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

  const isStudent = roleFromPath === "candidate";
  const isRecruiter = roleFromPath === "company";

  // Theme configuration
  const theme = isStudent
    ? "bg-[#0F766E] border-[#115E59]" // Teal for Students (Academic/Safe)
    : isRecruiter
      ? "bg-[#0B1F3A] border-[#1E293B]" // Navy for Recruiters (Corporate/Control)
      : "bg-white border-gray-200"; // Fallback

  const activeTabClass = isStudent
    ? "bg-white/10 text-white shadow-sm ring-1 ring-white/20"
    : isRecruiter
      ? "bg-[#1E293B] text-white shadow-sm ring-1 ring-white/10"
      : "bg-blue-50 text-blue-700 border border-blue-200";

  const inactiveTabClass = isStudent || isRecruiter
    ? "text-white/70 hover:bg-white/5 hover:text-white"
    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";

  const iconActiveColor = isStudent || isRecruiter ? "text-white" : "text-blue-700";
  const iconInactiveColor = isStudent || isRecruiter ? "text-white/60" : "text-gray-500";

  const logoBg = isStudent
    ? "bg-white/10 text-white"
    : isRecruiter
      ? "bg-blue-600 text-white"
      : "bg-gradient-to-r from-blue-600 to-purple-600 text-white";

  const textColor = isStudent || isRecruiter ? "text-white" : "text-gray-900";
  const subTextColor = isStudent || isRecruiter ? "text-white/60" : "text-gray-500";
  const logoutClass = isStudent || isRecruiter
    ? "text-white/70 hover:bg-white/10 hover:text-white"
    : "text-gray-600 hover:bg-red-50 hover:text-red-600";

  return (
    <div className={`w-64 border-r h-screen flex flex-col transition-colors duration-300 ${theme}`}>
      <div className={`p-6 border-b ${isStudent ? 'border-white/10' : isRecruiter ? 'border-white/5' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm overflow-hidden ${logoBg}`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-xl font-bold tracking-tight font-serif ${textColor}`}>VeriTrust</h1>
            <p className={`text-sm ${subTextColor}`}>{workspaceLabel}</p>
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
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? activeTabClass : inactiveTabClass
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? iconActiveColor : iconInactiveColor}`} />
              <span className="font-medium font-sans">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className={`p-4 border-t ${isStudent ? 'border-white/10' : isRecruiter ? 'border-white/5' : 'border-gray-200'}`}>
        <button
          onClick={connectWallet}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-colors mb-2 ${walletAddress
            ? (isStudent || isRecruiter ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700")
            : (isStudent || isRecruiter ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900")
            }`}
        >
          <Wallet className="w-4 h-4" />
          <span className="text-sm font-medium">
            {walletAddress
              ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
              : "Connect Wallet"
            }
          </span>
        </button>

        <button
          onClick={logoutClick}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-colors ${logoutClass}`}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>
    </div>
  );
};
