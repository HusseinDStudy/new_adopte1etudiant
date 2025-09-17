import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../common/LanguageSwitcher';
import AccessibilityPanel from '../common/AccessibilityPanel';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';

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
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white pt-[env(safe-area-inset-top)] shadow-sm">
      <a href="#main-content" className="sr-only focus:not-sr-only">
        {t('a11y.skipToContent', { defaultValue: 'Skip to main content' })}
      </a>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-sm font-bold text-white">AE</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Adopte un Étudiant</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden items-center space-x-8 md:flex" aria-label="Primary">
            <Link
              to="/offers"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/offers')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {t('navigation.offers')}
            </Link>

            <Link
              to="/students"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/students')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {t('navigation.students')}
            </Link>



            <Link
              to="/blog"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/blog')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {t('navigation.blog')}
            </Link>

            <Link
              to="/contact"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/contact')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {t('navigation.contact')}
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <LanguageSwitcher />
            <AccessibilityPanel />
            {/* Mobile menu button */}
            <button
              className="rounded-md p-2 hover:bg-gray-100 md:hidden"
              aria-label={t('navigation.openMenu', { defaultValue: 'Open menu' })}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Hide the heavy action cluster on small screens; expose via mobile menu */}
            {isAuthenticated ? (
              <div className="hidden items-center space-x-2 sm:flex">
                {/* Dashboard Icon */}
                <Link
                  to="/dashboard"
                  className={`rounded-md p-2 transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-400 hover:text-gray-500'
                  }`}
                  title={t('navigation.dashboard') || 'Dashboard'}
                  aria-label={t('navigation.dashboard') || 'Dashboard'}
                >
                  <svg className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                  </svg>
                </Link>

                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-500" type="button" aria-label={t('dashboard.notifications') || 'Notifications'}>
                  <svg className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v2.25l2.25 2.25v2.25H2.25v-2.25L4.5 12V9.75a6 6 0 0 1 6-6z" />
                  </svg>
                  <span className="absolute right-0 top-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                </button>

                {/* Messages */}
                <Link
                  to={user?.role === 'ADMIN' ? '/admin/messages' : '/conversations'}
                  className="relative p-2 text-gray-400 hover:text-gray-500"
                  aria-label={t('navigation.messages') || 'Messages'}
                >
                  <svg className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </Link>

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 rounded-md p-2 hover:bg-gray-50">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                        <span className="text-sm font-medium text-white">
                          {user?.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="hidden text-sm font-medium text-gray-700 md:block">
                        {user?.email}
                      </span>
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuItem className="p-0">
                      <Link to="/profile" className="block w-full rounded-sm px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        {t('navigation.profile')}
                      </Link>
                    </DropdownMenuItem>
                    <div className="my-1 h-px bg-neutral-200" />
                    <DropdownMenuItem
                      className="text-red-700"
                      onSelect={(e) => {
                        e.preventDefault();
                        logout();
                      }}
                    >
                      {t('navigation.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden items-center space-x-2 md:flex">
                <Link
                  to="/login"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  {t('navigation.login')}
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            aria-hidden="true"
            onClick={closeMobile}
          />
          <div className="relative z-40 border-t border-gray-200 bg-white shadow-sm md:hidden" role="dialog" aria-modal="true" aria-label={t('navigation.mobileNavigation', { defaultValue: 'Mobile navigation' })}>
          <nav ref={mobileMenuRef} className="mx-auto max-w-7xl space-y-1 px-4 py-3" aria-label="Mobile">
            <Link
              to="/offers"
              onClick={closeMobile}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                isActive('/offers') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('navigation.offers')}
            </Link>
            <Link
              to="/students"
              onClick={closeMobile}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                isActive('/students') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('navigation.students')}
            </Link>
            <Link
              to="/blog"
              onClick={closeMobile}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                isActive('/blog') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('navigation.blog')}
            </Link>
            <Link
              to="/contact"
              onClick={closeMobile}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                isActive('/contact') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('navigation.contact')}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={closeMobile} className={`block rounded-md px-3 py-2 text-sm font-medium ${isActive('/dashboard') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {t('navigation.dashboard')}
                </Link>
                <Link to={user?.role === 'ADMIN' ? '/admin/messages' : '/conversations'} onClick={closeMobile} className={`block rounded-md px-3 py-2 text-sm font-medium ${isActive(user?.role === 'ADMIN' ? '/admin/messages' : '/conversations') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {t('navigation.messages')}
                </Link>
                <Link to="/profile" onClick={closeMobile} className={`block rounded-md px-3 py-2 text-sm font-medium ${isActive('/profile') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {t('navigation.profile')}
                </Link>
                <button onClick={() => { closeMobile(); logout(); }} className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-700 hover:bg-red-50">
                  {t('navigation.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className={`block rounded-md px-3 py-2 text-sm font-medium ${isActive('/login') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {t('navigation.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobile}
                  className={`block rounded-md px-3 py-2 text-sm font-medium ${isActive('/register') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {t('navigation.register')}
                </Link>
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
