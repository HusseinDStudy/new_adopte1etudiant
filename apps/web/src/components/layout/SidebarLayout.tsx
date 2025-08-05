import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Mobile sidebar toggle button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-20 left-4 z-30 p-2 rounded-md bg-white shadow-md hover:bg-gray-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SidebarLayout;
