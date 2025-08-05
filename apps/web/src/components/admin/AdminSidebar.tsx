import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Briefcase,
  MessageSquare,
  BarChart3,
  Settings,
  Tag,
  Plus,
  List,
  Eye,
  User,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Tableau de bord',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Blog',
    href: '/admin/blog',
    icon: FileText,
    children: [
      {
        name: 'Tous les articles',
        href: '/admin/blog/posts',
        icon: List,
      },
      {
        name: 'Nouvel article',
        href: '/admin/blog/posts/new',
        icon: Plus,
      },
      {
        name: 'Catégories',
        href: '/admin/blog/categories',
        icon: Tag,
      },
    ],
  },
  {
    name: 'Utilisateurs',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Offres',
    href: '/admin/offers',
    icon: Briefcase,
  },
  {
    name: 'Messages',
    href: '/admin/messages',
    icon: MessageSquare,
  },
  {
    name: 'Statistiques',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'Profil',
    href: '/admin/profile',
    icon: User,
  },
  {
    name: 'Paramètres',
    href: '/admin/settings',
    icon: Settings,
  },
];

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const isActiveLink = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    const isActive = isActiveLink(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isParentActive = hasChildren && item.children?.some(child => isActiveLink(child.href));

    return (
      <div key={item.href}>
        <Link
          to={item.href}
          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            level === 0 ? 'mb-1' : 'mb-0.5 ml-4'
          } ${
            isActive || isParentActive
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <item.icon className={`w-5 h-5 ${level === 0 ? 'mr-3' : 'mr-2'}`} />
          {item.name}
        </Link>

        {/* Render children if they exist and parent is active */}
        {hasChildren && (isActive || isParentActive) && (
          <div className="ml-2 mt-1 mb-2">
            {item.children?.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto z-30">
      <div className="p-4">
        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Actions rapides
          </h3>
          <div className="space-y-2">
            <Link
              to="/admin/blog/posts/new"
              className="flex items-center px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvel article
            </Link>
            <Link
              to="/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              Voir le blog
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Navigation
          </h3>
          <div className="space-y-1">
            {sidebarItems.map(item => renderSidebarItem(item))}
          </div>
        </nav>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Adopte1Etudiant Admin
          </p>
          <p className="text-xs text-gray-400 text-center mt-1">
            Version 1.0.0
          </p>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
