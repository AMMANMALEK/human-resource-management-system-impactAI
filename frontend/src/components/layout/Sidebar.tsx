import { ChevronLeft, ChevronRight, LayoutDashboard, Users, Calendar, Settings, UserCircle, Plus, LogOut, Clock, DollarSign, BarChart3 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../constants/roles';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
  closeMobileSidebar: () => void;
}

const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Employees', icon: Users, path: '/admin/employees' },
  { label: 'Leave Requests', icon: Calendar, path: '/admin/leaves' },
  { label: 'Payroll', icon: DollarSign, path: '/admin/payroll' },
  { label: 'Profile', icon: UserCircle, path: '/admin/profile' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

const EMPLOYEE_NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/employee/dashboard' },
  { label: 'Attendance', icon: Clock, path: '/employee/attendance' },
  { label: 'Apply Leave', icon: Plus, path: '/employee/apply-leave' },
  { label: 'My Leaves', icon: Calendar, path: '/employee/leaves' },
  { label: 'Profile', icon: UserCircle, path: '/employee/profile' },
  { label: 'Settings', icon: Settings, path: '/employee/settings' },
];

export function Sidebar({ isOpen, toggleSidebar, isMobile, closeMobileSidebar }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.role === ROLES.ADMIN ? ADMIN_NAV_ITEMS : EMPLOYEE_NAV_ITEMS;

  // If mobile, the sidebar acts as a drawer/overlay
  // If desktop, it's a fixed sidebar that can collapse

  const sidebarClasses = cn(
    "fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col",
    isMobile
      ? (isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64")
      : (isOpen ? "w-64" : "w-20")
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={closeMobileSidebar}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
          <div className={cn("flex items-center gap-2 overflow-hidden whitespace-nowrap", !isOpen && !isMobile && "w-0 opacity-0")}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Oddo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold text-gray-800">Oddo</span>
          </div>

          {/* Toggle Button (Desktop only here, usually) */}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          )}

          {/* Mobile close button (optional, but clicking overlay is standard) */}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={isMobile ? closeMobileSidebar : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                      isActive
                        ? "bg-primary-50 text-primary-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon size={22} className={cn("min-w-[22px]", isActive ? "text-primary-600" : "text-gray-500 group-hover:text-gray-700")} />

                    <span className={cn(
                      "whitespace-nowrap transition-all duration-300 origin-left",
                      !isOpen && !isMobile ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
                    )}>
                      {item.label}
                    </span>

                    {/* Tooltip for collapsed state */}
                    {!isOpen && !isMobile && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-gray-100">
          <div className={cn(
            "flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-50 text-left transition-colors group relative",
            !isOpen && !isMobile ? "justify-center" : ""
          )}>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium shrink-0 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>
                  {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className={cn(
              "overflow-hidden transition-all duration-300",
              !isOpen && !isMobile ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
            )}>
              <p className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                {user?.name || user?.email || 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase() || 'Employee'}</p>
            </div>

            {(isOpen || isMobile) && (
              <button
                onClick={handleLogout}
                className="ml-auto p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
