import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HeroSection from '../components/common/HeroSection';

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <>
      {/* Hero Section - Full Width */}
      <HeroSection
        title={
          <>
            Adoptez <span className="text-blue-200">le talent</span><br />
            qui vous correspond
          </>
        }
        description={t('home.platformDescription')}
        variant="large"
      >
        <div className="flex flex-col justify-center gap-6 sm:flex-row">
          <Link
            to="/register"
            className="transform rounded-xl bg-teal-500 px-10 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-teal-600 hover:shadow-2xl"
          >
            {t('home.getStarted')}
          </Link>
          <Link
            to="/offers"
            className="transform rounded-xl bg-white px-10 py-4 text-lg font-semibold text-blue-700 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-gray-50 hover:shadow-2xl"
          >
            {t('home.viewOffers')}
          </Link>
        </div>
      </HeroSection>

      {/* Rest of content with container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

      {/* Statistics Section */}
      <div className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
            <div className="group rounded-2xl bg-white p-10 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 transition-all duration-300 group-hover:rotate-3 group-hover:scale-110 group-hover:bg-blue-100">
                <svg className="h-10 w-10 text-blue-500 transition-all duration-300 group-hover:text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div className="mb-3 text-4xl font-bold text-blue-600 transition-colors duration-300 group-hover:text-blue-700">2,500+</div>
              <div className="font-medium text-gray-600 transition-colors duration-300 group-hover:text-gray-700">{t('home.activeStudents')}</div>
            </div>

            <div className="group rounded-2xl bg-white p-10 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 transition-all duration-300 group-hover:rotate-3 group-hover:scale-110 group-hover:bg-blue-100">
                <svg className="h-10 w-10 text-blue-500 transition-all duration-300 group-hover:text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z"/>
                </svg>
              </div>
              <div className="mb-3 text-4xl font-bold text-blue-600 transition-colors duration-300 group-hover:text-blue-700">500+</div>
              <div className="font-medium text-gray-600 transition-colors duration-300 group-hover:text-gray-700">{t('home.partnerCompanies')}</div>
            </div>

            <div className="group rounded-2xl bg-white p-10 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 transition-all duration-300 group-hover:rotate-3 group-hover:scale-110 group-hover:bg-blue-100">
                <svg className="h-10 w-10 text-blue-500 transition-all duration-300 group-hover:text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <div className="mb-3 text-4xl font-bold text-blue-600 transition-colors duration-300 group-hover:text-blue-700">1,200+</div>
              <div className="font-medium text-gray-600 transition-colors duration-300 group-hover:text-gray-700">{t('home.filledInternships')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Features Section */}
      <div className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <div className="mb-4 text-lg font-semibold uppercase tracking-wide text-blue-500">{t('home.ourServices')}</div>
            <h2 className="mb-6 break-words text-5xl font-bold text-gray-900">{t('home.completePlatform')}</h2>
            <p className="mx-auto max-w-4xl text-xl leading-relaxed text-gray-600">
              {t('home.discoverOurServices')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
            {/* Profil personnalisé */}
            <div className="group text-center transition-all duration-300 hover:-translate-y-2 hover:transform">
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-blue-100 group-hover:to-blue-200 group-hover:shadow-lg">
                <svg className="h-12 w-12 text-blue-500 transition-all duration-300 group-hover:text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <h3 className="mb-6 text-2xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-700">{t('home.personalizedProfile')}</h3>
              <p className="mb-6 text-lg leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                {t('home.personalizedProfileDescription')}
              </p>
              <Link to="/login" className="inline-flex items-center text-lg font-semibold text-blue-500 transition-all duration-300 hover:text-blue-600 group-hover:translate-x-1">
                {t('navigation.login')}
                <svg className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Offres ciblées */}
            <div className="group text-center transition-all duration-300 hover:-translate-y-2 hover:transform">
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-blue-100 group-hover:to-blue-200 group-hover:shadow-lg">
                <svg className="h-12 w-12 text-blue-500 transition-all duration-300 group-hover:text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
              </div>
              <h3 className="mb-6 text-2xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-700">{t('home.targetedOffers')}</h3>
              <p className="mb-6 text-lg leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                {t('home.targetedOffersDescription')}
              </p>
              <Link to="/offers" className="inline-flex items-center text-lg font-semibold text-blue-500 transition-all duration-300 hover:text-blue-600 group-hover:translate-x-1">
                {t('home.viewOffers')}
                <svg className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Mise en relation */}
            <div className="group text-center transition-all duration-300 hover:-translate-y-2 hover:transform">
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-blue-100 group-hover:to-blue-200 group-hover:shadow-lg">
                <svg className="h-12 w-12 text-blue-500 transition-all duration-300 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mb-6 text-2xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-700">{t('home.directContact')}</h3>
              <p className="mb-6 text-lg leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                {t('home.directContactDescription')}
              </p>
              <Link to="/students" className="inline-flex items-center text-lg font-semibold text-blue-500 transition-all duration-300 hover:text-blue-600 group-hover:translate-x-1">
                {t('home.viewProfiles')}
                <svg className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 py-24">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 200C200 100 400 300 600 200C700 150 750 250 800 200V400H0V200Z" fill="white"/>
            <circle cx="100" cy="100" r="50" fill="white"/>
            <circle cx="700" cy="300" r="40" fill="white"/>
          </svg>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-8 text-5xl font-bold leading-tight text-white md:text-6xl">
            {t('home.readyToStart')}
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-2xl leading-relaxed text-blue-100">
            {t('home.joinCommunity')}
          </p>
          <Link
            to="/register"
            className="hover:shadow-3xl inline-block transform rounded-2xl bg-white px-12 py-5 text-xl font-bold text-blue-700 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:bg-gray-50"
          >
            {t('home.createFreeAccount')}
          </Link>
        </div>
      </div>
      </div>
    </>
  );
};

export default HomePage;