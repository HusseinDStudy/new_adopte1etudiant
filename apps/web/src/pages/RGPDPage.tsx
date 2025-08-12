import React from 'react';
import HeroSection from '../components/common/HeroSection';
import { Shield, Database, Users, Lock, Eye, FileText, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RGPDPage: React.FC = () => {
  const { t } = useTranslation();

  const dataTypes = [
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: t('gdpr.dataTypes.identification.title'),
      items: t('gdpr.dataTypes.identification.items', { returnObjects: true }) as string[],
    },
    {
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      title: t('gdpr.dataTypes.academic.title'),
      items: t('gdpr.dataTypes.academic.items', { returnObjects: true }) as string[],
    },
    {
      icon: <Database className="h-6 w-6 text-blue-600" />,
      title: t('gdpr.dataTypes.professional.title'),
      items: t('gdpr.dataTypes.professional.items', { returnObjects: true }) as string[],
    },
  ];

  const rights = [
    {
      icon: <Eye className="h-6 w-6 text-blue-600" />,
      title: t('gdpr.rights.accessTitle'),
      description: t('gdpr.rights.accessDescription'),
    },
    {
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      title: t('gdpr.rights.rectificationTitle'),
      description: t('gdpr.rights.rectificationDescription'),
    },
    {
      icon: <Lock className="h-6 w-6 text-blue-600" />,
      title: t('gdpr.rights.erasureTitle'),
      description: t('gdpr.rights.erasureDescription'),
    },
    {
      icon: <Lock className="h-6 w-6 text-blue-600" />,
      title: t('gdpr.rights.portabilityTitle'),
      description: t('gdpr.rights.portabilityDescription'),
    },
  ];

  return (
    <>
      <HeroSection title={t('gdpr.title')} description={t('gdpr.description')} variant="default" />

      <div className="min-h-[100dvh] bg-gray-50">
        <div className="mx-auto max-w-5xl space-y-12 px-4 py-16 sm:px-6 lg:px-8">
          {/* Intro */}
          <section className="rounded-2xl bg-white p-8 text-center shadow-lg">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900">{t('gdpr.introTitle')}</h2>
            <p className="leading-relaxed text-gray-600">{t('gdpr.introText')}</p>
            <div className="mt-6 inline-flex items-center rounded-lg bg-blue-50 px-4 py-2">
              <span className="text-sm font-medium text-blue-700">{t('gdpr.lastUpdated')}</span>
            </div>
          </section>

          {/* Data collected */}
          <section className="rounded-2xl bg-white p-8 shadow-lg">
            <div className="mb-6 flex items-center gap-3">
              <Database className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-semibold">{t('gdpr.dataCollectedTitle')}</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {dataTypes.map((block, idx) => (
                <div key={idx} className="rounded-xl border p-6">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      {block.icon}
                    </div>
                  </div>
                  <h4 className="mb-3 text-center text-lg font-semibold">{block.title}</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {block.items.map((item, i) => (
                      <li key={i} className="flex items-center">
                        <div className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Usage & legal bases */}
          <section className="rounded-2xl bg-white p-8 shadow-lg">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-xl border p-6">
                <h3 className="mb-3 text-lg font-semibold">{t('gdpr.usage.purposesTitle')}</h3>
                <ul className="space-y-2 text-gray-600">
                  {(t('gdpr.usage.purposesList', { returnObjects: true }) as string[]).map((text, i) => (
                    <li key={i} className="flex items-start">
                      <div className="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border p-6">
                <h3 className="mb-3 text-lg font-semibold">{t('gdpr.usage.legalBasesTitle')}</h3>
                <ul className="space-y-2 text-gray-600">
                  {(t('gdpr.usage.legalBasesList', { returnObjects: true }) as string[]).map((text, i) => (
                    <li key={i} className="flex items-start">
                      <div className="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-600" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Rights */}
          <section className="rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-900 p-8 shadow-lg">
            <div className="mb-8 text-center text-white">
              <h3 className="mb-2 text-2xl font-semibold">{t('gdpr.rights.title')}</h3>
              <p className="text-white/80">{t('gdpr.description')}</p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {rights.map((r, idx) => (
                <div key={idx} className="rounded-xl bg-white p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      {r.icon}
                    </div>
                    <div>
                      <h4 className="mb-1 text-lg font-semibold">{r.title}</h4>
                      <p className="text-gray-600">{r.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact DPO */}
          <section className="rounded-2xl bg-white p-8 shadow-lg">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">{t('gdpr.contact.title')}</h3>
              <p className="mb-6 text-gray-600">{t('gdpr.contact.description')}</p>
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <a href="mailto:dpo@adopte-un-etudiant.fr" className="font-medium text-blue-600 hover:text-blue-800">
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


