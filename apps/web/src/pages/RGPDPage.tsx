import React from 'react';
import HeroSection from '../components/common/HeroSection';
import { Shield, Database, Users, Lock, Eye, FileText, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RGPDPage: React.FC = () => {
  const { t } = useTranslation();

  const dataTypes = [
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: t('gdpr.dataTypes.identification.title'),
      items: t('gdpr.dataTypes.identification.items', { returnObjects: true }) as string[],
    },
    {
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      title: t('gdpr.dataTypes.academic.title'),
      items: t('gdpr.dataTypes.academic.items', { returnObjects: true }) as string[],
    },
    {
      icon: <Database className="w-6 h-6 text-blue-600" />,
      title: t('gdpr.dataTypes.professional.title'),
      items: t('gdpr.dataTypes.professional.items', { returnObjects: true }) as string[],
    },
  ];

  const rights = [
    {
      icon: <Eye className="w-6 h-6 text-blue-600" />,
      title: t('gdpr.rights.accessTitle'),
      description: t('gdpr.rights.accessDescription'),
    },
    {
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      title: t('gdpr.rights.rectificationTitle'),
      description: t('gdpr.rights.rectificationDescription'),
    },
    {
      icon: <Lock className="w-6 h-6 text-blue-600" />,
      title: t('gdpr.rights.erasureTitle'),
      description: t('gdpr.rights.erasureDescription'),
    },
    {
      icon: <Lock className="w-6 h-6 text-blue-600" />,
      title: t('gdpr.rights.portabilityTitle'),
      description: t('gdpr.rights.portabilityDescription'),
    },
  ];

  return (
    <>
      <HeroSection title={t('gdpr.title')} description={t('gdpr.description')} variant="default" />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
          {/* Intro */}
          <section className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('gdpr.introTitle')}</h2>
            <p className="text-gray-600 leading-relaxed">{t('gdpr.introText')}</p>
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700 font-medium">{t('gdpr.lastUpdated')}</span>
            </div>
          </section>

          {/* Data collected */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold">{t('gdpr.dataCollectedTitle')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dataTypes.map((block, idx) => (
                <div key={idx} className="border rounded-xl p-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {block.icon}
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold mb-3 text-center">{block.title}</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {block.items.map((item, i) => (
                      <li key={i} className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Usage & legal bases */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3">{t('gdpr.usage.purposesTitle')}</h3>
                <ul className="space-y-2 text-gray-600">
                  {(t('gdpr.usage.purposesList', { returnObjects: true }) as string[]).map((text, i) => (
                    <li key={i} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3">{t('gdpr.usage.legalBasesTitle')}</h3>
                <ul className="space-y-2 text-gray-600">
                  {(t('gdpr.usage.legalBasesList', { returnObjects: true }) as string[]).map((text, i) => (
                    <li key={i} className="flex items-start">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Rights */}
          <section className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl shadow-lg p-8">
            <div className="text-center text-white mb-8">
              <h3 className="text-2xl font-semibold mb-2">{t('gdpr.rights.title')}</h3>
              <p className="text-white/80">{t('gdpr.description')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rights.map((r, idx) => (
                <div key={idx} className="bg-white rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {r.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-1">{r.title}</h4>
                      <p className="text-gray-600">{r.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact DPO */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center max-w-2xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('gdpr.contact.title')}</h3>
              <p className="text-gray-600 mb-6">{t('gdpr.contact.description')}</p>
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <a href="mailto:dpo@adopte-un-etudiant.fr" className="text-blue-600 hover:text-blue-800 font-medium">
                    dpo@adopte-un-etudiant.fr
                  </a>
                </div>
                <p className="text-sm text-gray-500">{t('gdpr.contact.responseTime')}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default RGPDPage;


