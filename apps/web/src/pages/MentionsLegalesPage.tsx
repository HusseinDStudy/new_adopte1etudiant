import React from 'react';
import HeroSection from '../components/common/HeroSection';
import { useTranslation } from 'react-i18next';
import { Building2, User, Server, Copyright, Shield, File } from 'lucide-react';

const MentionsLegalesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <HeroSection
        title={t('legalNotice.title')}
        description={t('legalNotice.subtitle')}
        variant="default"
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-10">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <File className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <section className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('legalNotice.editor.title')}</h2>
                  <div className="space-y-2 text-gray-600">
                    <p><strong>{t('legalNotice.editor.companyName')}</strong></p>
                    <p>{t('legalNotice.editor.legalForm')}</p>
                    <p>{t('legalNotice.editor.shareCapital')}</p>
                    <p>{t('legalNotice.editor.rcs')}</p>
                    <p>{t('legalNotice.editor.siret')}</p>
                    <p>{t('legalNotice.editor.vat')}</p>
                    <p>{t('legalNotice.editor.address')}</p>
                    <p>
                      {t('legalNotice.labels.email')} :{' '}
                      <a href={`mailto:${t('legalNotice.editor.email')}`} className="text-blue-600 hover:text-blue-800">
                        {t('legalNotice.editor.email')}
                      </a>
                    </p>
                    <p>
                      {t('legalNotice.labels.phone')} :{' '}
                      <a href={`tel:${t('legalNotice.editor.phone')}`} className="text-blue-600 hover:text-blue-800">
                        {t('legalNotice.editor.phone')}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('legalNotice.publication.title')}</h2>
                  <div className="text-gray-600 space-y-1">
                    <p>{t('legalNotice.publication.director')}</p>
                    <p>{t('legalNotice.publication.editorialManager')}</p>
                    <p>
                      {t('legalNotice.labels.email')} :{' '}
                      <a href={`mailto:${t('legalNotice.publication.email')}`} className="text-blue-600 hover:text-blue-800">
                        {t('legalNotice.publication.email')}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Server className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('legalNotice.hosting.title')}</h2>
                  <div className="space-y-4 text-gray-600">
                    <div>
                      <p className="font-medium">{t('legalNotice.hosting.mainHostTitle')}</p>
                      <p>{t('legalNotice.hosting.mainHostName')}</p>
                      <p>{t('legalNotice.hosting.mainHostAddress1')}</p>
                      <p>{t('legalNotice.hosting.mainHostAddress2')}</p>
                      <p>{t('legalNotice.hosting.mainHostPhone')}</p>
                    </div>
                    <div>
                      <p className="font-medium">{t('legalNotice.hosting.cdnTitle')}</p>
                      <p>{t('legalNotice.hosting.cdnName')}</p>
                      <p>{t('legalNotice.hosting.cdnAddress')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Copyright className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('legalNotice.intellectualProperty.title')}</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>{t('legalNotice.intellectualProperty.p1')}</p>
                    <p>{t('legalNotice.intellectualProperty.p2')}</p>
                    <p>{t('legalNotice.intellectualProperty.p3')}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('legalNotice.dataProtection.title')}</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>{t('legalNotice.dataProtection.p1')}</p>
                    <p>{t('legalNotice.dataProtection.p2')}</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        {t('legalNotice.dataProtection.contactEmail')}
                      </li>
                      <li>
                        {t('legalNotice.dataProtection.contactMail')}
                      </li>
                    </ul>
                    <p>
                      {t('legalNotice.dataProtection.cnilPrompt')}{' '}
                      <a href="https://www.cnil.fr" className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">
                        {t('legalNotice.dataProtection.cnilLabel')}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">{t('legalNotice.additionalInfoTitle')}</h3>
                <p className="text-blue-700 text-sm">{t('legalNotice.additionalInfoText')}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default MentionsLegalesPage;


