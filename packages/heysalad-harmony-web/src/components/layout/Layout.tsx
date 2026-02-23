import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Shield,
  MapPin,
  Calendar,
  Clock,
  Receipt,
  Heart,
  DollarSign,
  CheckCircle,
  ShoppingCart,
  Scale,
  AlertTriangle,
  Monitor,
  Mic,
  BookOpen,
  Briefcase,
  Bot,
} from 'lucide-react';
import { useAuth } from '../../App';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import { Role } from '../../types';

interface MenuItem {
  icon: any;
  label: string;
  href: string;
}

const Layout = () => {
  const { currentUser, currentRole, setCurrentRole } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRoleChange = (role: Role) => {
    setCurrentRole(role);
    setRoleDropdownOpen(false);
  };

  const getMenuItemsForRole = (): { main: MenuItem[]; bottom: MenuItem[] } => {
    const universalItems: MenuItem[] = [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    ];

    const universalBottomItems: MenuItem[] = [
      { icon: Clock, label: 'Timesheets', href: '/timesheets' },
      { icon: Receipt, label: 'Payslips', href: '/payslips' },
      { icon: Shield, label: 'Benefits', href: '/benefits' },
      { icon: Heart, label: 'Wellbeing', href: '/wellbeing' },
      { icon: Monitor, label: 'IT Support', href: '/it' },
      { icon: BookOpen, label: 'Training', href: '/training' },
      { icon: Mic, label: 'Voice', href: '/voice' },
      { icon: Settings, label: 'Settings', href: '/settings' },
    ];

    if (currentRole === 'HR Manager') {
      return {
        main: [
          ...universalItems,
          { icon: Bot, label: 'Workforce', href: '/workforce' },
          { icon: Package, label: 'Packages', href: '/packages' },
          { icon: Users, label: 'Employees', href: '/employees' },
          { icon: Briefcase, label: 'Recruitment', href: '/recruitment' },
          { icon: CheckCircle, label: 'Approvals', href: '/approvals' },
          { icon: DollarSign, label: 'Finance', href: '/finance' },
          { icon: Scale, label: 'Legal', href: '/legal' },
          { icon: FileText, label: 'Documents', href: '/documents' },
        ],
        bottom: universalBottomItems,
      };
    } else if (currentRole === 'Operations Manager') {
      return {
        main: [
          ...universalItems,
          { icon: Bot, label: 'Workforce', href: '/workforce' },
          { icon: Users, label: 'Team Overview', href: '/team' },
          { icon: AlertTriangle, label: 'Safety', href: '/safety' },
          { icon: MapPin, label: 'Locations', href: '/locations' },
          { icon: Briefcase, label: 'Recruitment', href: '/recruitment' },
          { icon: CheckCircle, label: 'Approvals', href: '/approvals' },
          { icon: ShoppingCart, label: 'Procurement', href: '/procurement' },
          { icon: DollarSign, label: 'Finance', href: '/finance' },
        ],
        bottom: universalBottomItems,
      };
    } else {
      return {
        main: [
          ...universalItems,
          { icon: FileText, label: 'My Documents', href: '/my-documents' },
          { icon: Calendar, label: 'My Schedule', href: '/my-schedule' },
        ],
        bottom: universalBottomItems,
      };
    }
  };

  const menuConfig = getMenuItemsForRole();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1a1a] border-r border-zinc-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo - HeySalad Harmony branding */}
        <div className="flex items-center gap-3 p-6 border-b border-zinc-800">
          <img 
            src="/heysalad-white-logo.svg" 
            alt="HeySalad Harmony" 
            className="h-10"
          />
        </div>

        {/* Main Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuConfig.main.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all rounded-lg ${
                isActive(item.href) 
                  ? 'bg-[#E01D1D] text-white' 
                  : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom Menu */}
        <div className="border-t border-zinc-800 p-4 space-y-1">
          {menuConfig.bottom.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all rounded-lg ${
                isActive(item.href) 
                  ? 'bg-[#E01D1D] text-white' 
                  : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-zinc-800 bg-[#1a1a1a]">
          <div className="flex items-center gap-3 px-3 py-3 bg-zinc-900 rounded-lg">
            <div className="w-10 h-10 bg-[#E01D1D] flex items-center justify-center rounded-lg">
              <span className="text-white font-bold text-sm">
                {currentUser?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{currentUser?.name}</p>
              <p className="text-xs text-zinc-400 truncate">{currentUser?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#1a1a1a] border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-zinc-800 transition-colors rounded-lg">
              {sidebarOpen ? <X className="w-6 h-6 text-zinc-300" /> : <Menu className="w-6 h-6 text-zinc-300" />}
            </button>

            <div className="hidden lg:block">
              <h2 className="text-2xl font-bold text-white">{currentRole} Dashboard</h2>
              <p className="text-sm text-zinc-400 mt-0.5">Welcome back, {currentUser?.name?.split(' ')[0]}!</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Role Switcher */}
              {currentUser && currentUser.roles.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 border-2 border-zinc-700 hover:border-[#E01D1D]/50 hover:bg-zinc-800 transition-all rounded-lg"
                  >
                    <span className="text-sm font-semibold text-white">{currentRole}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {roleDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setRoleDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] shadow-xl border-2 border-zinc-800 rounded-lg py-2 z-50">
                        <div className="px-4 py-2 border-b border-zinc-800">
                          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Switch Role</p>
                        </div>
                        {currentUser.roles.map((role: string) => (
                          <button
                            key={role}
                            onClick={() => handleRoleChange(role as Role)}
                            className={`w-full text-left px-4 py-3 text-sm font-medium transition-all ${
                              currentRole === role ? 'bg-[#E01D1D]/20 text-[#E01D1D]' : 'text-zinc-300 hover:bg-zinc-800'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-red-900/20 hover:text-red-400 transition-all rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[#0a0a0a]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
