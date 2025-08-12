import React from 'react';
import { useTranslation } from 'react-i18next';
import HeroSection from '../components/common/HeroSection';

const MissionsPage: React.FC = () => {
  const { t } = useTranslation();
  const missions = [
    {
      icon: (
        <svg className="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      title: t('missions.personalizedSupport'),
      description: t('missions.personalizedSupportDescription')
    },
    {
      icon: (
        <svg className="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: t('missions.matching'),
      description: t('missions.matchingDescription')
    },
    {
      icon: (
        <svg className="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: t('missions.pedagogicalInnovation'),
      description: t('missions.pedagogicalInnovationDescription')
    },
    {
      icon: (
        <svg className="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: t('missions.continuousTraining'),
      description: t('missions.continuousTrainingDescription')
    }
  ];

  const stats = [
    { number: "5000+", label: t('missions.studentsAccompanied') },
    { number: "1000+", label: t('missions.partnerCompanies') },
    { number: "90%", label: t('missions.insertionRate') }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection
        title={t('missions.ourMissions')}
        subtitle={t('missions.missionsSubtitle')}
        variant="medium"
      />

      {/* Missions Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {missions.map((mission, index) => (
              <div key={index} className="group flex items-start space-x-6 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:transform hover:bg-gray-50 hover:shadow-lg">
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 transition-all duration-300 group-hover:rotate-3 group-hover:scale-110 group-hover:bg-blue-100">
                  {mission.icon}
                </div>
                <div>
                  <h3 className="mb-4 text-2xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-700">{mission.title}</h3>
                  <p className="text-lg leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-700">{mission.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">{t('missions.ourImpact')}</h2>
            <div className="mx-auto h-1 w-24 bg-blue-600"></div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {stats.map((stat, index) => (
              <div key={index} className="group text-center transition-all duration-300 hover:-translate-y-2 hover:transform">
                <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-blue-100 transition-all duration-300 group-hover:rotate-3 group-hover:scale-110 group-hover:bg-blue-200 group-hover:shadow-lg">
                  <span className="text-4xl font-bold text-blue-600 transition-colors duration-300 group-hover:text-blue-700">{stat.number}</span>
                </div>
                <p className="text-xl font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-700">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-4xl font-bold text-white">{t('missions.readyToJoin')}</h2>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-blue-100">
            {t('missions.ctaDescription')}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="/students"
              className="inline-flex transform items-center rounded-lg bg-white px-8 py-4 font-semibold text-blue-600 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-50 hover:shadow-2xl active:scale-95"
            >
              {t('missions.discoverStudents')}
            </a>
            <a
              href="/contact"
              className="inline-flex transform items-center rounded-lg border-2 border-white bg-transparent px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-white hover:text-blue-600 hover:shadow-2xl active:scale-95"
            >
              {t('missions.contactUs')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MissionsPage;
