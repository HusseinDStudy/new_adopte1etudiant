import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Users,
  Briefcase,
  MessageSquare,
  BarChart3,
  Tag,
  Plus,
  User as UserIcon,
  Settings as SettingsIcon,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    // Dashboard - always first
    {
      label: 'Dashboard',
      path: (() => {
        if (user?.role === 'ADMIN') {
          return '/admin/dashboard';
        } else if (user?.role === 'COMPANY') {
          return '/dashboard-company';
        } else if (user?.role === 'STUDENT') {
          return '/dashboard-student';
        } else {
          return '/dashboard';
        }
      })(),
      icon: <LayoutDashboard className="w-5 h-5" />,
      show: isAuthenticated,
    },
    // Profile
    {
      label: user?.role === 'COMPANY' ? 'Profil Entreprise' : user?.role === 'ADMIN' ? 'Profil Admin' : 'Profil',
      path: user?.role === 'ADMIN' ? '/admin/profile' : '/profile',
      icon: <UserIcon className="w-5 h-5" />,
      show: isAuthenticated,
    },
    // Admin specific items
    {
      label: 'Articles du blog',
      path: '/admin/blog/posts',
      icon: <FileText className="w-5 h-5" />,
      show: isAuthenticated && user?.role === 'ADMIN',
    },
    {
      label: 'Nouvel article',
      path: '/admin/blog/posts/new',
      icon: <Plus className="w-5 h-5" />,
      show: isAuthenticated && user?.role === 'ADMIN',
    },
    {
      label: 'Catégories',
      path: '/admin/blog/categories',
      icon: <Tag className="w-5 h-5" />,
      show: isAuthenticated && user?.role === 'ADMIN',
    },
    {
      label: 'Utilisateurs',
      path: '/admin/users',
      icon: <Users className="w-5 h-5" />,
      show: isAuthenticated && user?.role === 'ADMIN',
    },
    {
      label: 'Offres',
      path: '/admin/offers',
      icon: <Briefcase className="w-5 h-5" />,
      show: isAuthenticated && user?.role === 'ADMIN',
    },
    {
      label: 'Messages',
      path: '/admin/messages',
      icon: <MessageSquare className="w-5 h-5" />,
      show: isAuthenticated && user?.role === 'ADMIN',
    },
    {
      label: 'Statistiques',
      path: '/admin/analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      show: isAuthenticated && user?.role === 'ADMIN',
    },
    // Student specific items
    {
      label: 'Candidatures',
      path: '/my-applications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      show: user?.role === 'STUDENT',
    },
    {
      label: 'Adoption',
      path: '/my-adoption-requests',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      show: user?.role === 'STUDENT',
    },
    // Company specific items
    {
      label: 'Gestion des offres',
      path: '/company/offers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      show: user?.role === 'COMPANY',
    },

    {
      label: 'Demandes envoyées',
      path: '/company/sent-requests',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
      show: user?.role === 'COMPANY',
    },
    
    // Common items
    {
      label: 'Messages',
      path: user?.role === 'ADMIN' ? '/admin/messages' : '/conversations',
      icon: (
        user?.role === 'ADMIN' ? <MessageSquare className="w-5 h-5" /> : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )
      ),
      show: isAuthenticated && user?.role !== 'ADMIN',
    },
    {
      label: 'Paramètres',
      path: user?.role === 'ADMIN' ? '/admin/settings' : '/settings',
      icon: (
        user?.role === 'ADMIN' ? <SettingsIcon className="w-5 h-5" /> : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      ),
      show: isAuthenticated,
    },
  ];

  const filteredMenuItems = menuItems.filter(item => item.show);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Mobile close button (no logo to avoid duplication with header) */}
          <div className="lg:hidden flex justify-end p-4 border-b border-gray-200">
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive(item.path)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <span className={isActive(item.path) ? 'text-blue-700' : 'text-gray-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User section */}
          {isAuthenticated && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role?.toLowerCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
