import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* À propos */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-blue-400">{t('footer.about')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-300 transition-colors hover:text-white">
                  {t('footer.whoWeAre')}
                </Link>
              </li>
              <li>
                <Link to="/team" className="text-gray-300 transition-colors hover:text-white">
                  {t('footer.ourTeam')}
                </Link>
              </li>
              <li>
                <Link to="/missions" className="text-gray-300 transition-colors hover:text-white">
                  {t('footer.ourMissions')}
                </Link>
              </li>
              <li>
                <Link to="/partners" className="text-gray-300 transition-colors hover:text-white">
                  {t('footer.ourPartners')}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 transition-colors hover:text-white">
                  {t('footer.blogAndResources')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-blue-400">{t('footer.services')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/offers" className="text-gray-300 transition-colors hover:text-white">
                  {t('navigation.offers')}
                </Link>
              </li>
              <li>
                <Link to="/students" className="text-gray-300 transition-colors hover:text-white">
                  {t('footer.students')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 transition-colors hover:text-white">
                  {t('footer.createAccount')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 transition-colors hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-blue-400">{t('footer.contact')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <svg className="h-4 w-4 flex-shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:contact@adopte-un-etudiant.fr" className="text-sm text-gray-300 transition-colors hover:text-white">
                  contact@adopte-un-etudiant.fr
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="h-4 w-4 flex-shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+33123456789" className="text-sm text-gray-300 transition-colors hover:text-white">
                  +33 1 23 45 67 89
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-gray-300">
                  {t('footer.location')}
                </span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-blue-400">{t('footer.newsletter')}</h3>
            <p className="mb-4 text-sm leading-relaxed text-gray-300">
              {t('footer.newsletterDescription')}
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                {t('footer.subscribe')}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-gray-800 pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="text-sm text-gray-400">
              {t('footer.copyright')}
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm md:justify-end">
              <Link to="/accessibility" className="text-gray-400 transition-colors hover:text-white">
                {t('navigation.accessibility', { defaultValue: 'Accessibility' })}
              </Link>
              <Link to="/privacy" className="text-gray-400 transition-colors hover:text-white">
                {t('footer.privacyPolicy')}
              </Link>
              <Link to="/terms" className="text-gray-400 transition-colors hover:text-white">
                {t('footer.termsOfService')}
              </Link>
              <Link to="/cookies" className="text-gray-400 transition-colors hover:text-white">
                {t('footer.cookies')}
              </Link>
              <Link to="/mentions-legales" className="text-gray-400 transition-colors hover:text-white">
                {t('footer.legalNotice')}
              </Link>
              <Link to="/rgpd" className="text-gray-400 transition-colors hover:text-white">
                {t('footer.gdpr')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
