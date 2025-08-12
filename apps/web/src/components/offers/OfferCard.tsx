import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface OfferCardProps {
  offer: {
    id: string;
    title: string;
    company: {
      name: string;
    };
    location?: string | null;
    skills?: string[];
    matchScore?: number;
    type?: string;
    duration?: string | null;
    salary?: string;
    description?: string;
  };
  isApplied?: boolean;
  userRole?: 'STUDENT' | 'COMPANY' | 'ADMIN';
  onApply?: (offerId: string) => void;
  isApplying?: boolean;
}

const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  isApplied = false,
  userRole,
  onApply,
  isApplying = false
}) => {
  const { t } = useTranslation();
  const getRingColor = (score: number) => {
    if (score > 75) return 'stroke-green-500';
    if (score > 40) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  const getTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'stage':
        return 'bg-blue-100 text-blue-800';
      case 'alternance':
        return 'bg-purple-100 text-purple-800';
      case 'cdi':
        return 'bg-green-100 text-green-800';
      case 'cdd':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:transform hover:shadow-xl">
      {/* Match Score Ring */}
      {userRole === 'STUDENT' && offer.matchScore !== undefined && (
        <div className="absolute right-4 top-4 hidden sm:block">
          <div className="relative h-16 w-16">
            <svg className="h-16 w-16 -rotate-90 transform">
              <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="4" className="text-gray-200" />
              <circle
                cx="32"
                cy="32"
                r="24"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 24}
                strokeDashoffset={(2 * Math.PI * 24) * (1 - (offer.matchScore || 0) / 100)}
                className={`transition-all duration-500 ${getRingColor(offer.matchScore || 0)}`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
              {offer.matchScore}%
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={userRole === 'STUDENT' && offer.matchScore !== undefined ? "pr-20" : ""}>
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
              {offer.title}
            </h3>
            <p className="font-medium text-gray-600">{offer.company.name}</p>
          </div>
          {offer.type && (
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getTypeColor(offer.type)}`}>
              {offer.type}
            </span>
          )}
        </div>

        {/* Location and Duration */}
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
          {offer.location && (
            <div className="flex items-center space-x-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="break-words">{offer.location}</span>
            </div>
          )}
          {offer.duration && (
            <div className="flex items-center space-x-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{offer.duration}</span>
            </div>
          )}
          {offer.salary && (
            <div className="flex items-center space-x-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span>{offer.salary}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {offer.description && (
          <p className="mb-4 line-clamp-2 text-sm text-gray-600">
            {offer.description}
          </p>
        )}

        {/* Skills */}
        {offer.skills && offer.skills.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {offer.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
              >
                {skill}
              </span>
            ))}
            {offer.skills.length > 4 && (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
                +{offer.skills.length - 4} {t('offers.others')}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to={`/offers/${offer.id}`}
            className="group inline-flex transform items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:scale-105 hover:bg-blue-700 hover:shadow-lg active:scale-95"
          >
            {t('offers.viewDetails')}
            <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          {userRole === 'STUDENT' && (
            <div className="flex items-center gap-2">
              {isApplied ? (
                <div className="flex items-center space-x-1 rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t('offers.applicationSent')}</span>
                </div>
              ) : onApply && (
                <button
                  onClick={() => onApply(offer.id)}
                  disabled={isApplying}
                  className="transform rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-blue-700 hover:shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {isApplying ? t('offers.sending') : t('offers.apply')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferCard;