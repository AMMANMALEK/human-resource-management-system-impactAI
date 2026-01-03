import { Bell, Search, Menu } from 'lucide-react';
import { cn } from '../../lib/utils';

import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  toggleMobileSidebar: () => void;
}

export function Navbar({ toggleMobileSidebar }: NavbarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 w-full h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>

        {/* Search (Optional) */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-400 transition-all w-64">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm text-gray-700 w-full placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User Dropdown Trigger */}
        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm cursor-pointer overflow-hidden">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span>
              {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
