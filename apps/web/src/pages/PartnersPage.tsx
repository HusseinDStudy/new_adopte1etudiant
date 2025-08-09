import React from 'react';
import { useTranslation } from 'react-i18next';
import HeroSection from '../components/common/HeroSection';

const PartnersPage: React.FC = () => {
  const { t } = useTranslation();
  const companyPartners = [
    { 
      name: "Google", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png",
      website: "https://google.com"
    },
    { 
      name: "Microsoft", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2560px-Microsoft_logo.svg.png",
      website: "https://microsoft.com"
    },
    { 
      name: "Apple", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1667px-Apple_logo_black.svg.png",
      website: "https://apple.com"
    },
    { 
      name: "Amazon", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png",
      website: "https://amazon.com"
    },
    { 
      name: "Meta", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/2560px-Meta_Platforms_Inc._logo.svg.png",
      website: "https://meta.com"
    },
    { 
      name: "Netflix", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png",
      website: "https://netflix.com"
    }
  ];

  const schoolPartners = [
    { 
      name: "École Polytechnique", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Logo_%C3%89cole_Polytechnique.svg/2560px-Logo_%C3%89cole_Polytechnique.svg.png",
      website: "https://polytechnique.edu"
    },
    { 
      name: "HEC Paris", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/HEC_Paris_logo.svg/2560px-HEC_Paris_logo.svg.png",
      website: "https://hec.edu"
    },
    { 
      name: "ESSEC", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/ESSEC_Business_School_logo.svg/2560px-ESSEC_Business_School_logo.svg.png",
      website: "https://essec.edu"
    },
    { 
      name: "Sciences Po", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Sciences_Po_logo.svg/2560px-Sciences_Po_logo.svg.png",
      website: "https://sciencespo.fr"
    },
    { 
      name: "EPITECH", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/EPITECH_logo.svg/2560px-EPITECH_logo.svg.png",
      website: "https://epitech.eu"
    },
    { 
      name: "ESCP", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/ESCP_Business_School_logo.svg/2560px-ESCP_Business_School_logo.svg.png",
      website: "https://escp.eu"
    }
  ];

  const benefits = [
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      title: t('partners.visibility'),
      description: t('partners.visibilityDescription')
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: t('partners.recruitment'),
      description: t('partners.recruitmentDescription')
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: t('partners.support'),
      description: t('partners.supportDescription')
    }
  ];

  const partnershipSteps = [
    {
      number: "1",
      title: t('partners.visibility'),
      description: t('partners.visibilityDescription')
    },
    {
      number: "2", 
      title: t('partners.recruitment'),
      description: t('partners.recruitmentDescription')
    },
    {
      number: "3",
      title: t('partners.support'), 
      description: t('partners.supportDescription')
    }
  ];

  return (
    <div className="min-h-[100dvh] bg-white">
      {/* Hero Section */}
      <HeroSection
        title={t('partners.ourPartners')}
        subtitle={t('partners.partnersSubtitle')}
        variant="medium"
      />

      {/* Company Partners Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
               <h2 className="text-3xl font-bold text-gray-900 break-words">{t('partners.companyPartners')}</h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('partners.companyPartnersDescription')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {companyPartners.map((partner, index) => (
              <a 
                key={index} 
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-50 rounded-lg p-6 flex items-center justify-center hover:shadow-lg hover:bg-gray-100 transition-all duration-300 group"
              >
                <img 
                  src={partner.logo} 
                  alt={partner.name}
                  className="max-w-full max-h-16 object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-semibold text-blue-600">{partner.name}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* School Partners Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
               <h2 className="text-3xl font-bold text-gray-900 break-words">{t('partners.schoolPartners')}</h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('partners.schoolPartnersDescription')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {schoolPartners.map((partner, index) => (
              <a 
                key={index} 
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-lg p-6 flex items-center justify-center hover:shadow-lg hover:bg-gray-50 transition-all duration-300 group"
              >
                <img 
                  src={partner.logo} 
                  alt={partner.name}
                  className="max-w-full max-h-16 object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-semibold text-blue-600">{partner.name}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Steps */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {partnershipSteps.map((step, index) => (
              <div key={index} className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg transition-all duration-300">
                  <span className="text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-300">{step.number}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left side - Title and description */}
              <div>
                <div className="flex items-center mb-6">
                  <svg className="w-10 h-10 text-white mr-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="m11 17 2 2a1 1 0 1 0 3-3"></path>
                    <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"></path>
                    <path d="m21 3 1 11h-2"></path>
                    <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"></path>
                    <path d="M3 4h8"></path>
                  </svg>
                  <h2 className="text-3xl font-bold text-white">{t('partners.becomePartner')}</h2>
                </div>
                <p className="text-blue-100 mb-8 leading-relaxed text-lg">
                  {t('partners.becomePartnerDescription')}
                </p>
                <a
                  href="/contact"
                  className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 hover:scale-105 hover:shadow-xl transition-all duration-300 transform active:scale-95 group"
                >
                  {t('partners.contactUs')}
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>

              {/* Right side - Advantages Box */}
              <div className="bg-blue-500/30 backdrop-blur-sm rounded-3xl p-4 max-w-sm">
                <h3 className="text-xl font-bold text-white mb-6">{t('partners.partnerAdvantages')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center text-white">
                    <div className="w-5 h-5 bg-blue-200/80 rounded-full mr-3 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>{t('partners.priorityAccess')}</span>
                  </div>
                  <div className="flex items-center text-white">
                    <div className="w-5 h-5 bg-blue-200/80 rounded-full mr-3 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>{t('partners.exclusiveEvents')}</span>
                  </div>
                  <div className="flex items-center text-white">
                    <div className="w-5 h-5 bg-blue-200/80 rounded-full mr-3 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>{t('partners.personalizedContent')}</span>
                  </div>
                  <div className="flex items-center text-white">
                    <div className="w-5 h-5 bg-blue-200/80 rounded-full mr-3 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>{t('partners.dedicatedSupport')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartnersPage;
