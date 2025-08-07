import React, { useState } from 'react';
import Sidebar from '../layout/Sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, subtitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile sidebar toggle button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-20 left-4 z-30 p-2 rounded-md bg-white shadow-md hover:bg-gray-50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {(title || subtitle) && (
            <div className="mb-8">
              {title && (
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
              )}
              {subtitle && <p className="text-gray-600">{subtitle}</p>}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
