import { useTranslation } from 'react-i18next';

export const useLocalizedDate = () => {
  const { i18n } = useTranslation();

  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    };

    return dateObj.toLocaleDateString(locale, defaultOptions);
  };

  const formatDateTime = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options,
    };

    return dateObj.toLocaleDateString(locale, defaultOptions);
  };

  const formatRelativeDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return i18n.t('dates.today');
    } else if (diffDays === 2) {
      return i18n.t('dates.yesterday');
    } else if (diffDays <= 7) {
      return i18n.t('dates.thisWeek');
    } else if (diffDays <= 14) {
      return i18n.t('dates.lastWeek');
    } else {
      return formatDate(dateObj);
    }
  };

  return {
    formatDate,
    formatDateTime,
    formatRelativeDate,
  };
}; 