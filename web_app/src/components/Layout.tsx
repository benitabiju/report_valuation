import { ReactNode, useState } from 'react';
import { 
  LayoutDashboard, 
  Upload, 
  FolderTree, 
  FileEdit, 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'upload', label: 'Upload & Process', icon: <Upload size={20} /> },
  { id: 'files', label: 'File Management', icon: <FolderTree size={20} /> },
  { id: 'editor', label: 'Report Editor', icon: <FileEdit size={20} /> },
  { id: 'review', label: 'Review & Approval', icon: <CheckCircle size={20} /> },
];

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md border border-gray-200"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar for Desktop & Mobile */}
      <aside className={`
        ${sidebarOpen ? 'w-64' : 'w-20'} 
        bg-white border-r border-gray-200 flex flex-col
        fixed lg:static h-full z-40 transition-all duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header with Toggle Button */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen ? (
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 truncate">Valuation System</h1>
              <p className="text-sm text-gray-500 mt-1 truncate">AI-Powered Reports</p>
            </div>
          ) : (
            <div className="mx-auto">
              <h1 className="text-xl font-bold text-gray-900">VS</h1>
            </div>
          )}
          
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-gray-100 ml-2"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <ChevronLeft size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false); // Close mobile menu on navigation
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
                ${currentPage === item.id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
                }
                ${!sidebarOpen ? 'justify-center' : ''}
              `}
              title={!sidebarOpen ? item.label : ''}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              {sidebarOpen && (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className={`
          p-4 border-t border-gray-200
          ${!sidebarOpen ? 'flex justify-center' : ''}
        `}>
          <div className={`flex items-center gap-3 ${!sidebarOpen ? 'flex-col' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium flex-shrink-0">
              RK
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Kannapan</p>
                <p className="text-xs text-gray-500 truncate">Senior Valuator</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`
        flex-1 overflow-auto transition-all duration-300
        ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-20'}
      `}>
        {/* Desktop Toggle Button when sidebar is collapsed */}
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="hidden lg:block fixed top-6 left-6 z-30 p-2 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50"
            title="Expand sidebar"
          >
            <ChevronRight size={18} />
          </button>
        )}

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}