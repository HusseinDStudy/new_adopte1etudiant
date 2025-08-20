# Internationalization (i18n) Guide

This guide outlines the internationalization (i18n) system implemented in the "Adopte1Etudiant" web application, allowing for multi-language support (English and French).

## 1. Overview

The application uses `i18next` along with `react-i18next` for seamless integration of translations into React components. `i18next-browser-languagedetector` automatically detects the user's preferred language from their browser settings.

## 2. Setup and Configuration

### Core Libraries

- `i18next`: The main internationalization framework.
- `react-i18next`: Hooks and components to integrate `i18next` with React.
- `i18next-browser-languagedetector`: Detects user language from browser, localStorage, etc.
- `i18next-http-backend`: Loads translations from a backend (e.g., public/locales directory).

### Dependencies

```json
{
  "react-i18next": "^14.0.0",
  "i18next": "^23.0.0",
  "i18next-browser-languagedetector": "^7.0.0",
  "i18next-http-backend": "^2.0.0"
}
```

### Configuration (`apps/web/src/i18n/i18n.ts`)

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en', // default language if detection fails
    debug: import.meta.env.DEV, // enable debug mode in development
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // path to translation files
    },
    ns: ['common', 'navigation', 'forms', 'blog', 'legal'], // namespaces
    defaultNS: 'common', // default namespace
  });

export default i18n;
```

## 3. Translation Files

Translations are organized by language and namespace within the `public/locales` directory:

```
public/
└── locales/
    ├── en/
    │   ├── common.json
    │   ├── navigation.json
    │   ├── forms.json
    │   └── blog.json
    └── fr/
        ├── common.json
        ├── navigation.json
        ├── forms.json
        └── blog.json
```

### Example Translation File (`public/locales/en/common.json`)

```json
{
  "welcome": "Welcome to Adopte1Etudiant!",
  "hello": "Hello {{name}}",
  "readMore": "Read more",
  "save": "Save",
  "cancel": "Cancel"
}
```

## 4. Usage in React Components

### Using the `useTranslation` Hook

The `useTranslation` hook is the primary way to access translation functions in functional components.

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';

const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('hello', { name: 'John' })}</p>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('fr')}>Français</button>
    </div>
  );
};

export default HomePage;
```

### Translation with Interpolation

For content that includes dynamic values, you can use interpolation.

```tsx
// Translation key: "messageSentToUsers": "Message sent to {{count}} user(s)."
// Usage: const message = t('success.messageSentToUsers', { count: 5 });
```

### Using `Trans` Component for Rich Text

For content that includes HTML or needs dynamic components within translated strings, use the `Trans` component.

```typescript
import React from 'react';
import { Trans } from 'react-i18next';

const Footer: React.FC = () => {
  return (
    <footer>
      <p>
        <Trans i18nKey="copyright">
          All rights reserved &copy; <strong>Adopte1Etudiant</strong> {{year}}.
        </Trans>
      </p>
    </footer>
  );
};

export default Footer;
```

### Date and Number Formatting

`i18next` can be extended with plugins for date and number formatting. For dates, consider using a custom hook like `useLocalizedDate` to ensure consistent and localized date/time displays:

```typescript
// apps/web/src/hooks/useLocalizedDate.ts
import { useTranslation } from 'react-i18next';

const useLocalizedDate = () => {
  const { i18n } = useTranslation();

  const formatDate = (dateString: string | Date, options?: Intl.DateTimeFormatOptions) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, options).format(date);
  };

  const formatDateTime = (dateString: string | Date, options?: Intl.DateTimeFormatOptions) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, { dateStyle: 'short', timeStyle: 'short', ...options }).format(date);
  };

  const formatRelativeDate = (dateString: string | Date, options?: Intl.RelativeTimeFormatOptions) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto', ...options });

    if (diffDays === 0) return rtf.format(0, 'day');
    if (diffDays === 1) return rtf.format(1, 'day');
    if (diffDays === -1) return rtf.format(-1, 'day');
    if (diffDays > 1) return rtf.format(diffDays, 'day');
    return rtf.format(diffDays, 'day');
  };

  return { formatDate, formatDateTime, formatRelativeDate };
};

export default useLocalizedDate;

// Usage in component
import useLocalizedDate from 'src/hooks/useLocalizedDate';

const BlogPost: React.FC<{ date: string }> = ({ date }) => {
  const { formatDate, formatRelativeDate } = useLocalizedDate();
  return (
    <p>
      Published on: {formatDate(date, { year: 'numeric', month: 'long', day: 'numeric' })} ({formatRelativeDate(date)})
    </p>
  );
};
```

## 5. Language Switching

The `i18n.changeLanguage(lng)` function allows dynamic language switching. A language switcher component can be implemented as follows:

```typescript
// apps/web/src/components/common/LanguageSwitcher.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'fr' : 'en');
  };

  return (
    <button onClick={toggleLanguage}>
      {i18n.language === 'en' ? 'Français' : 'English'}
    </button>
  );
};

export default LanguageSwitcher;
```

## 6. Translation Structure

Translations are organized by language and namespace within the `public/locales` directory. Each namespace typically corresponds to a functional area or type of content.

### Common UI Elements
```json
{
  "common": {
    "loading": "Chargement...",
    "error": "Erreur",
    "success": "Succès",
    "save": "Enregistrer",
    "cancel": "Annuler"
  }
}
```

### Loading States
```json
{
  "loading": {
    "loadingStudents": "Chargement des étudiants...",
    "loadingOffers": "Chargement des offres...",
    "loadingStatistics": "Chargement des statistiques..."
  }
}
```

### Error Messages
```json
{
  "errors": {
    "loadingError": "Erreur de chargement",
    "fillRequiredFields": "Veuillez remplir tous les champs obligatoires",
    "generalError": "Une erreur s'est produite"
  }
}
```

### Navigation
```json
{
  "navigation": {
    "home": "Accueil",
    "offers": "Offres",
    "students": "Étudiants",
    "contact": "Contact"
  }
}
```

## 7. Best Practices

- **Namespaces**: Organize translations into namespaces (e.g., `common`, `navigation`, `forms`) to avoid large, unmanageable files and improve loading performance.
- **Keys**: Use descriptive and consistent naming conventions for translation keys.
- **Interpolation**: Utilize interpolation (`{{key}}`) for dynamic values and `Trans` component for rich text with HTML.
- **Fallbacks**: Always define a `fallbackLng` in your i18n configuration to ensure content is displayed even if a translation is missing.
- **Lazy Loading**: For large applications, consider lazy-loading translation namespaces to optimize initial load times.
- **Component Structure**: Always use the `useTranslation` hook in your components instead of hardcoding text.

```tsx
// ✅ Good
const MyComponent = () => {
  const { t } = useTranslation();
  return <h1>{t('page.title')}</h1>;
};

// ❌ Avoid
const MyComponent = () => {
  return <h1>Title</h1>; // Hardcoded text
};
```

- **Date Formatting**: Use the `useLocalizedDate` hook for all date formatting to ensure consistency and locale-awareness.

```tsx
// ✅ Use the hook
const { formatDate } = useLocalizedDate();
const formattedDate = formatDate(date);

// ❌ Avoid hardcoded locales
const formattedDate = date.toLocaleDateString('fr-FR');
```

- **Number Formatting**: For numbers, use `Intl.NumberFormat` with `i18n.language` to ensure proper locale-based formatting (e.g., commas vs. periods for decimals).

```tsx
// ✅ Use i18n-aware formatting
const { i18n } = useTranslation();
const formattedNumber = new Intl.NumberFormat(
  i18n.language === 'fr' ? 'fr-FR' : 'en-US'
).format(number);
```

## 8. Adding New Translations

To add new translatable strings:

### 1. Add to French File (`public/locales/fr/<namespace>.json`)
```json
{
  "newFeature": {
    "title": "Nouveau titre",
    "description": "Nouvelle description"
  }
}
```

### 2. Add to English File (`public/locales/en/<namespace>.json`)
```json
{
  "newFeature": {
    "title": "New title",
    "description": "New description"
  }
}
```

### 3. Use in Component
```tsx
import { useTranslation } from 'react-i18next';

const MyNewFeatureComponent = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t('newFeature.title')}</h1>
      <p>{t('newFeature.description')}</p>
    </div>
  );
};
```

## 9. Testing

### Manual Testing
1. Switch language using the globe icon in the header.
2. Verify all visible text changes appropriately.
3. Check date and number formatting in different locales.
4. Test language persistence across page reloads (e.g., after closing and reopening the browser tab).

### Automated Testing

For automated tests, you can wrap your components with `I18nextProvider` to provide the i18n instance.

```tsx
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n'; // Adjust path if necessary

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

// Example usage in a test:
// test('renders translated title', () => {
//   renderWithI18n(<MyComponent />);
//   expect(screen.getByText('Translated Title')).toBeInTheDocument();
// });
```

## 10. Configuration Details

### Language Detection Order
The `i18next-browser-languagedetector` detects language in the following order by default:
1. Query string (`?lng=en`)
2. Cookie (`i18next`)
3. Local storage (`i18nextLng`)
4. Navigator (browser language)
5. HTML lang attribute
6. Fallback language (defined in `init` options, e.g., `en`)

### Debug Mode
Enabled in development mode (`import.meta.env.DEV`) to show missing translation keys and other i18n-related warnings in the browser console. This is very helpful during development.

```typescript
// In apps/web/src/i18n/i18n.ts
debug: import.meta.env.DEV,
```

### Backend Configuration
The `i18next-http-backend` is configured to load translations dynamically from the `public/locales` directory. This means translation files are served as static assets, and `i18next` fetches them as needed.

```typescript
// In apps/web/src/i18n/i18n.ts
backend: {
  loadPath: '/locales/{{lng}}/{{ns}}.json', // path to translation files
},
```

## 11. Future Enhancements

1. **Pluralization Support**
   - Implement advanced plural rules (e.g., `one`, `few`, `many`) for different languages to handle varying noun forms based on quantity.
   - Use `i18next-plural-postprocessor` or similar plugins.

2. **RTL (Right-to-Left) Support**
   - Integrate support for RTL languages (e.g., Arabic, Hebrew) by dynamically adjusting layout and text direction.
   - This involves CSS adjustments and potentially a context provider to manage `dir` attribute.

3. **Dynamic Translation Loading**
   - Optimize performance for larger applications by loading translation namespaces only when they are needed (e.g., specific to a page or component).
   - This reduces the initial bundle size.

4. **Translation Management System (TMS) Integration**
   - Connect to a TMS (e.g., Lokalise, Phrase, Crowdin) for streamlined translation workflows, collaborative translation, and quality assurance.
   - Automate the process of pushing/pulling translation files.

## 12. Troubleshooting

### Common Issues

1. **Missing Translation Keys**:
   - **Check Debug Messages**: Look at the browser console for warnings from `i18next` (if debug mode is enabled).
   - **Verify Key Existence**: Ensure the translation key exists with the exact spelling (case-sensitive) in both French (`fr.json`) and English (`en.json`) files for the correct namespace.
   - **Namespace Usage**: Confirm you are using the correct namespace when calling `useTranslation()` (e.g., `useTranslation('navigation')`).
   - **Fallback Text**: If a key is missing, `i18next` will typically display the key itself. Add a fallback to show a more user-friendly message.

2. **Date/Number Formatting Issues**:
   - **Locale Detection**: Verify that the correct locale is being detected and applied.
   - **Browser Compatibility**: Ensure the `Intl` API (used for `Intl.DateTimeFormat` and `Intl.NumberFormat`) is supported by the target browsers.
   - **`useLocalizedDate` Hook**: Always use the `useLocalizedDate` hook for dates and `Intl.NumberFormat` for numbers to avoid inconsistencies.

3. **Language Not Persisting**:
   - **Local Storage Permissions**: Check if local storage is enabled and accessible in the browser.
   - **i18n Configuration**: Verify the `LanguageDetector` configuration in `i18n.ts` to ensure it's set to persist language selection (e.g., via local storage).
   - **Browser Cache**: Sometimes, clearing the browser cache can resolve persistence issues.

### Debug Mode

As mentioned in the Configuration section, `debug: true` in `i18n.init` is your best friend for troubleshooting translation issues during development. It provides detailed console logs about loaded namespaces, missing keys, and language detection.

## 13. Contributing to Translations

When adding new features or modifying existing text, please follow these guidelines for internationalization:

1.  **Add Translations to Both Language Files**: Always provide translations for both French (`fr.json`) and English (`en.json`) files in the appropriate namespace.
2.  **Use the Translation System Consistently**: Avoid hardcoding any user-facing text directly in components. Use `t()` or `Trans` for all strings.
3.  **Test with Both Languages**: Before submitting any changes, manually test your new features or modifications in both French and English to ensure all text displays correctly.
4.  **Update Documentation if Needed**: If your changes introduce new i18n patterns, hooks, or complex scenarios, update this `Internationalization.md` guide.

## 14. Resources

- [React i18next Documentation](https://react.i18next.com/) - Official documentation for `react-i18next`.
- [i18next Documentation](https://www.i18next.com/) - Official documentation for the core `i18next` library.
- [ICU Message Format](https://formatjs.io/docs/core-concepts/icu-syntax/) - Learn more about the ICU Message Format for complex translations (e.g., pluralization, gender).
