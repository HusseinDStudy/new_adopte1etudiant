import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="bg-gray-50">
      {/* Admin Header */}
      <AdminHeader />
      
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Admin Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          {/* Page Header */}
          {(title || subtitle) && (
            <div className="mb-8">
              {title && (
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
              )}
              {subtitle && (
                <p className="text-gray-600">{subtitle}</p>
              )}
            </div>
          )}
          
          {/* Page Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
