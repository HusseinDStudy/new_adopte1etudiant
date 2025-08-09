import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../common/LanguageSwitcher';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const closeMobile = () => setMobileOpen(false);

  // Close mobile menu on Escape and trap focus within when open
  useEffect(() => {
    if (!mobileOpen) return;
    const menuEl = mobileMenuRef.current;
    const selectors = [
      'a[href]','button:not([disabled])','textarea','input[type="text"]','input[type="email"]','input[type="password"]','select','[tabindex]:not([tabindex="-1"])'
    ].join(',');
    const focusables = menuEl ? (Array.from(menuEl.querySelectorAll<HTMLElement>(selectors)) as HTMLElement[]) : [];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMobile();
      }
      if (e.key === 'Tab' && focusables.length > 0) {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [mobileOpen]);

  // Auto-close mobile menu on viewport upsize to md+
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setMobileOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AE</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Adopte un Étudiant</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="Primary">
            <Link
              to="/offers"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/offers')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {t('navigation.offers')}
            </Link>

            <Link
              to="/students"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/students')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {t('navigation.students')}
            </Link>



            <Link
              to="/blog"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/blog')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {t('navigation.blog')}
            </Link>

            <Link
              to="/contact"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/contact')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {t('navigation.contact')}
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <LanguageSwitcher />
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Hide the heavy action cluster on small screens; expose via mobile menu */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center space-x-2">
                {/* Dashboard Icon */}
                <Link
                  to="/dashboard"
                  className={`p-2 rounded-md transition-colors ${
                    isActive('/dashboard')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-400 hover:text-gray-500'
                  }`}
                  title="Dashboard"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                  </svg>
                </Link>

                {/* Notifications */}
                <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v2.25l2.25 2.25v2.25H2.25v-2.25L4.5 12V9.75a6 6 0 0 1 6-6z" />
                  </svg>
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                </button>

                {/* Messages */}
                <Link to={user?.role === 'ADMIN' ? '/admin/messages' : '/conversations'} className="p-2 text-gray-400 hover:text-gray-500 relative">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </Link>

                {/* User dropdown */}
                 <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user?.email}
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                    {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {t('navigation.profile')}
                    </Link>
                    {/* Settings removed */}
                    <hr className="my-1" />
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      {t('navigation.logout')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('navigation.login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  {t('navigation.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu sheet + overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            aria-hidden="true"
            onClick={closeMobile}
          />
          <div className="md:hidden border-t border-gray-200 bg-white shadow-sm relative z-40" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <nav ref={mobileMenuRef} className="max-w-7xl mx-auto px-4 py-3 space-y-1" aria-label="Mobile">
            <Link
              to="/offers"
              onClick={closeMobile}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/offers') ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('navigation.offers')}
            </Link>
            <Link
              to="/students"
              onClick={closeMobile}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/students') ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('navigation.students')}
            </Link>
            <Link
              to="/blog"
              onClick={closeMobile}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/blog') ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('navigation.blog')}
            </Link>
            <Link
              to="/contact"
              onClick={closeMobile}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/contact') ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('navigation.contact')}
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" onClick={closeMobile} className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard') ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {t('navigation.dashboard')}
                </Link>
                <Link to={user?.role === 'ADMIN' ? '/admin/messages' : '/conversations'} onClick={closeMobile} className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive(user?.role === 'ADMIN' ? '/admin/messages' : '/conversations') ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {t('navigation.messages')}
                </Link>
                <Link to="/profile" onClick={closeMobile} className={`block px-3 py-2 rounded-md text-sm font-medium ${isActive('/profile') ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {t('navigation.profile')}
                </Link>
                <button onClick={() => { closeMobile(); logout(); }} className="w-full text-left block px-3 py-2 rounded-md text-sm font-medium text-red-700 hover:bg-red-50">
                  {t('navigation.logout')}
                </button>
              </>
            )}
          </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
