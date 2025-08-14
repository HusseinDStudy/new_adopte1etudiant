import React from 'react';
import { useTranslation } from 'react-i18next';
import AccessibilityPanel from '../components/common/AccessibilityPanel';

const AccessibilityPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('accessibilityPage.title', { defaultValue: 'Accessibility' })}
        </h1>
        <p className="text-gray-600">
          {t(
            'accessibilityPage.intro',
            {
              defaultValue:
                "We want everyone to use our platform comfortably. This page explains the accessibility features available and how to use them.",
            }
          )}
        </p>
      </header>

      <section aria-labelledby="how-to-use" className="space-y-3">
        <h2 id="how-to-use" className="text-xl font-semibold text-gray-900">
          {t('accessibilityPage.howToUseTitle', { defaultValue: 'How to use' })}
        </h2>
        <p className="text-gray-700">
          {t(
            'accessibilityPage.howToUseText',
            {
              defaultValue:
                'Use the button below or the header button to open the accessibility panel and set your preferences. Your choices are saved in your browser.',
            }
          )}
        </p>
        <AccessibilityPanel />
      </section>

      <section aria-labelledby="what-you-can-adjust" className="space-y-3">
        <h2 id="what-you-can-adjust" className="text-xl font-semibold text-gray-900">
          {t('accessibilityPage.featuresTitle', { defaultValue: 'What you can adjust' })}
        </h2>
        <ul className="list-disc space-y-2 pl-6 text-gray-700">
          <li>
            <strong>{t('a11y.textSize.label', { defaultValue: 'Text size' })}</strong>: {t('accessibilityPage.features.textSize', { defaultValue: 'Increase overall text size for better readability.' })}
          </li>
          <li>
            <strong>{t('a11y.motion.label', { defaultValue: 'Motion' })}</strong>: {t('accessibilityPage.features.reduceMotion', { defaultValue: 'Reduce non-essential animations and transitions.' })}
          </li>
          <li>
            <strong>{t('a11y.reading.dyslexiaFont', { defaultValue: 'Dyslexia-friendly font' })}</strong>: {t('accessibilityPage.features.dyslexia', { defaultValue: 'Enable a reading-friendly setting that increases spacing and line-height.' })}
          </li>
          <li>
            <strong>{t('a11y.reading.underlineLinks', { defaultValue: 'Underline links' })}</strong>: {t('accessibilityPage.features.underlineLinks', { defaultValue: 'Force underlines on links to improve visibility.' })}
          </li>
          <li>
            <strong>{t('a11y.reading.grayscaleMedia', { defaultValue: 'Grayscale images and media' })}</strong>: {t('accessibilityPage.features.grayscale', { defaultValue: 'Display images and videos in grayscale to reduce visual fatigue.' })}
          </li>
        </ul>
      </section>

      <section aria-labelledby="built-in-a11y" className="space-y-3">
        <h2 id="built-in-a11y" className="text-xl font-semibold text-gray-900">
          {t('accessibilityPage.builtInTitle', { defaultValue: 'Built-in accessibility' })}
        </h2>
        <ul className="list-disc space-y-2 pl-6 text-gray-700">
          <li>{t('accessibilityPage.builtIn.keyboard', { defaultValue: 'Full keyboard navigation with visible focus styles.' })}</li>
          <li>{t('accessibilityPage.builtIn.skipLink', { defaultValue: 'Skip link to jump directly to the main content.' })}</li>
          <li>{t('accessibilityPage.builtIn.contrast', { defaultValue: 'Color contrast aiming to meet WCAG 2.2 AA.' })}</li>
          <li>{t('accessibilityPage.builtIn.semantic', { defaultValue: 'Semantic HTML and ARIA where appropriate.' })}</li>
          <li>{t('accessibilityPage.builtIn.focus', { defaultValue: 'Managed focus in dialogs and menus.' })}</li>
          <li>{t('accessibilityPage.builtIn.responsive', { defaultValue: 'Responsive layouts that respect system preferences.' })}</li>
          <li>{t('accessibilityPage.builtIn.i18n', { defaultValue: 'Internationalization with English and French content.' })}</li>
        </ul>
        <p className="text-gray-700">
          {t('accessibilityPage.standardsText', { defaultValue: 'We aim to meet WCAG 2.2 AA. If you encounter a barrier, please let us know so we can improve.' })}
        </p>
      </section>

      <section aria-labelledby="contact-a11y" className="space-y-3">
        <h2 id="contact-a11y" className="text-xl font-semibold text-gray-900">
          {t('accessibilityPage.contactTitle', { defaultValue: 'Need help or found an issue?' })}
        </h2>
        <p className="text-gray-700">
          {t('accessibilityPage.contactText', { email: 'accessibility@adopte-un-etudiant.fr', defaultValue: 'Contact us at accessibility@adopte-un-etudiant.fr. We aim to respond within 24 business hours.' })}
        </p>
      </section>
    </div>
  );
};

export default AccessibilityPage;


