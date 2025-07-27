import React from 'react';
import { Link } from 'react-router-dom';

interface OfferCardProps {
  offer: {
    id: string;
    title: string;
    company: {
      name: string;
    };
    location?: string;
    skills?: string[];
    matchScore?: number;
    type?: string;
    duration?: string;
    salary?: string;
    description?: string;
  };
  isApplied?: boolean;
  userRole?: 'STUDENT' | 'COMPANY';
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
    <div className="relative bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300 group">
      {/* Match Score Ring */}
      {userRole === 'STUDENT' && offer.matchScore !== undefined && (
        <div className="absolute top-4 right-4">
          <div className="relative w-16 h-16">
            <svg className="transform -rotate-90 w-16 h-16">
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
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {offer.title}
            </h3>
            <p className="text-gray-600 font-medium">{offer.company.name}</p>
          </div>
          {offer.type && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(offer.type)}`}>
              {offer.type}
            </span>
          )}
        </div>

        {/* Location and Duration */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
          {offer.location && (
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{offer.location}</span>
            </div>
          )}
          {offer.duration && (
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{offer.duration}</span>
            </div>
          )}
          {offer.salary && (
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span>{offer.salary}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {offer.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {offer.description}
          </p>
        )}

        {/* Skills */}
        {offer.skills && offer.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {offer.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {offer.skills.length > 4 && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                +{offer.skills.length - 4} autres
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Link
            to={`/offers/${offer.id}`}
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm hover:scale-105 hover:shadow-lg transition-all duration-300 shadow-sm transform active:scale-95 group"
          >
            Voir les détails
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          {userRole === 'STUDENT' && (
            <div className="flex items-center space-x-2">
              {isApplied ? (
                <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Candidature envoyée</span>
                </div>
              ) : onApply && (
                <button
                  onClick={() => onApply(offer.id)}
                  disabled={isApplying}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium hover:scale-105 hover:shadow-lg transition-all duration-300 transform active:scale-95"
                >
                  {isApplying ? 'Envoi...' : 'Postuler'}
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