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
    <div className="flex min-h-[100dvh]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile sidebar toggle button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-16 z-30 rounded-md bg-white p-2 shadow-md hover:bg-gray-50 lg:hidden"
        aria-label="Open sidebar"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <main className="min-h-0 flex-1 p-4 lg:p-8">
        <div className="mx-auto min-h-0 max-w-7xl">
          {(title || subtitle) && (
            <div className="mb-8">
              {title && (
                <h1 className="mb-2 text-3xl font-bold text-gray-900">{title}</h1>
              )}
              {subtitle && <p className="text-gray-600">{subtitle}</p>}
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
