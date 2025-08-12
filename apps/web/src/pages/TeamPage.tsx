import React from 'react';
import { useTranslation } from 'react-i18next';
import HeroSection from '../components/common/HeroSection';

const TeamPage: React.FC = () => {
  const { t } = useTranslation();
  const teamMembers = [
    {
      name: "Sophie Durand",
      role: t('team.ceo'),
      description: t('team.sophieDescription'),
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "sophie@adopte-un-etudiant.fr"
      }
    },
    {
      name: "Thomas Lefebvre",
      role: t('team.cto'),
      description: t('team.thomasDescription'),
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      social: {
        linkedin: "#",
        github: "#",
        email: "thomas@adopte-un-etudiant.fr"
      }
    },
    {
      name: "Amina Benali",
      role: t('team.schoolRelations'),
      description: t('team.aminaDescription'),
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "amina@adopte-un-etudiant.fr"
      }
    },
    {
      name: "Lucas Martin",
      role: t('team.companyRelations'),
      description: t('team.lucasDescription'),
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "lucas@adopte-un-etudiant.fr"
      }
    }
  ];

  const values = [
    {
      number: "1",
      title: t('team.transparency'),
      description: t('team.transparencyDescription')
    },
    {
      number: "2", 
      title: t('team.accessibility'),
      description: t('team.accessibilityDescription')
    },
    {
      number: "3",
      title: t('team.innovation'),
      description: t('team.innovationDescription')
    }
  ];

  return (
    <div className="min-h-[100dvh] bg-white">
      {/* Hero Section */}
      <HeroSection
        title={t('team.ourTeam')}
        subtitle={t('team.teamSubtitle')}
        variant="medium"
      />

      {/* Team Members Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="group overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:transform hover:shadow-xl">
                <div className="flex aspect-square items-center justify-center bg-blue-50 transition-colors duration-300 group-hover:bg-blue-100">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="h-32 w-32 rounded-full object-cover shadow-lg transition-all duration-300 group-hover:rotate-3 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="flex hidden h-32 w-32 items-center justify-center rounded-full bg-blue-200 transition-all duration-300 group-hover:rotate-3 group-hover:scale-110 group-hover:bg-blue-300">
                    <span className="text-4xl font-bold text-blue-600 transition-colors duration-300 group-hover:text-blue-700">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                   <h3 className="mb-2 break-words text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-700">{member.name}</h3>
                  <p className="mb-3 font-medium text-blue-600 transition-colors duration-300 group-hover:text-blue-700">{member.role}</p>
                  <p className="mb-4 text-sm leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-700">{member.description}</p>
                  
                  <div className="flex space-x-3">
                    <a href={member.social.linkedin} className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 transition-colors hover:bg-blue-200">
                      <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    <a href={member.social.twitter || member.social.github} className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 transition-colors hover:bg-blue-200">
                      <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                    <a href={`mailto:${member.social.email}`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 transition-colors hover:bg-blue-200">
                      <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">{t('team.ourValues')}</h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              {t('team.valuesSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {values.map((value, index) => (
              <div key={index} className="group rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:transform hover:shadow-xl">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-blue-200">
                  <span className="text-2xl font-bold text-blue-600 transition-colors duration-300 group-hover:text-blue-700">{value.number}</span>
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-700">{value.title}</h3>
                <p className="leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-700">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Team Section */}
      <section className="bg-blue-600 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-4xl font-bold text-white">{t('team.joinOurTeam')}</h2>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-blue-100">
            {t('team.joinTeamDescription')}
          </p>
          <a
            href="/careers"
            className="group inline-flex transform items-center rounded-lg bg-white px-8 py-4 font-semibold text-blue-600 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-50 hover:shadow-2xl active:scale-95"
          >
            {t('team.viewJobOffers')}
            <svg className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
};

export default TeamPage;
