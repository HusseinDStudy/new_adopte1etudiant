# Internationalization (i18n) System

This document describes the internationalization system implemented in the Adopte1Etudiant web application.

## Overview

The application uses **React i18next** for internationalization, supporting French (fr) and English (en) languages. The system follows industry best practices and provides a seamless user experience with automatic language detection and manual language switching.

## Architecture

### Core Files

- `src/i18n/index.ts` - Main i18n configuration
- `src/i18n/locales/fr.json` - French translations
- `src/i18n/locales/en.json` - English translations
- `src/components/common/LanguageSwitcher.tsx` - Language toggle component
- `src/hooks/useLocalizedDate.ts` - Localized date formatting hook

### Dependencies

```json
{
  "react-i18next": "^14.0.0",
  "i18next": "^23.0.0",
  "i18next-browser-languagedetector": "^7.0.0",
  "i18next-http-backend": "^2.0.0"
}
```

## Features

### ✅ Implemented Features

1. **Automatic Language Detection**
   - Browser language detection
   - Local storage persistence
   - Fallback to French (default)

2. **Language Switching**
   - Globe icon in header
   - Toggle between FR/EN
   - Persistent language selection

3. **Localized Date Formatting**
   - Automatic locale-based formatting
   - French: `dd/MM/yyyy`
   - English: `MM/dd/yyyy`
   - Relative date support (today, yesterday, etc.)

4. **Number Formatting**
   - French: `1 234,56`
   - English: `1,234.56`

5. **Translation Structure**
   - Organized by feature/component
   - Nested translation keys
   - Interpolation support

## Usage

### Basic Translation

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return <h1>{t('navigation.home')}</h1>;
};
```

### Translation with Interpolation

```tsx
// Translation key: "messageSentToUsers": "Message sent to {{count}} user(s)."
const message = t('success.messageSentToUsers', { count: 5 });
```

### Localized Date Formatting

```tsx
import { useLocalizedDate } from '../hooks/useLocalizedDate';

const MyComponent = () => {
  const { formatDate, formatDateTime, formatRelativeDate } = useLocalizedDate();
  
  return (
    <div>
      <p>{formatDate('2024-01-15')}</p>
      <p>{formatDateTime('2024-01-15T10:30:00')}</p>
      <p>{formatRelativeDate('2024-01-15')}</p>
    </div>
  );
};
```

### Language Switching

```tsx
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const Header = () => {
  return (
    <header>
      <LanguageSwitcher />
      {/* Other header content */}
    </header>
  );
};
```

## Translation Structure

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

## Best Practices

### 1. Translation Keys
- Use descriptive, hierarchical keys
- Group related translations together
- Use consistent naming conventions

### 2. Component Structure
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

### 3. Date Formatting
```tsx
// ✅ Use the hook
const { formatDate } = useLocalizedDate();
const formattedDate = formatDate(date);

// ❌ Avoid hardcoded locales
const formattedDate = date.toLocaleDateString('fr-FR');
```

### 4. Number Formatting
```tsx
// ✅ Use i18n-aware formatting
const { i18n } = useTranslation();
const formattedNumber = new Intl.NumberFormat(
  i18n.language === 'fr' ? 'fr-FR' : 'en-US'
).format(number);
```

## Adding New Translations

### 1. Add to French File (`fr.json`)
```json
{
  "newFeature": {
    "title": "Nouveau titre",
    "description": "Nouvelle description"
  }
}
```

### 2. Add to English File (`en.json`)
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
const { t } = useTranslation();
return (
  <div>
    <h1>{t('newFeature.title')}</h1>
    <p>{t('newFeature.description')}</p>
  </div>
);
```

## Testing

### Manual Testing
1. Switch language using the globe icon
2. Verify all text changes appropriately
3. Check date/number formatting
4. Test language persistence across page reloads

### Automated Testing
```tsx
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};
```

## Configuration

### Language Detection Order
1. Local storage (`i18nextLng`)
2. Browser language
3. HTML lang attribute
4. Fallback to French

### Debug Mode
Enabled in development mode to show missing translation keys.

### Backend Configuration
Configured to load translations from `/locales/{{lng}}/{{ns}}.json` for dynamic loading.

## Future Enhancements

1. **Pluralization Support**
   - Add plural rules for different languages
   - Support complex plural forms

2. **RTL Support**
   - Add Arabic language support
   - Implement RTL layout switching

3. **Dynamic Translation Loading**
   - Load translations on-demand
   - Reduce initial bundle size

4. **Translation Management**
   - Integration with translation management systems
   - Automated translation workflow

## Troubleshooting

### Common Issues

1. **Missing Translation Keys**
   - Check console for debug messages
   - Verify key exists in both language files
   - Use fallback text for missing keys

2. **Date Formatting Issues**
   - Ensure proper locale detection
   - Check browser compatibility
   - Use the `useLocalizedDate` hook

3. **Language Not Persisting**
   - Check localStorage permissions
   - Verify i18n configuration
   - Clear browser cache if needed

### Debug Mode
Enable debug mode in development to see missing translation keys:
```tsx
// In i18n/index.ts
debug: process.env.NODE_ENV === 'development'
```

## Contributing

When adding new features:

1. Add translations to both language files
2. Use the translation system consistently
3. Test with both languages
4. Update this documentation if needed

## Resources

- [React i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [ICU Message Format](https://formatjs.io/docs/core-concepts/icu-syntax/) 