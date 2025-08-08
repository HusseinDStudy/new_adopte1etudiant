import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface StudentCardProps {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    school?: string | null;
    degree?: string | null;
    skills?: string[];
    cvUrl?: string | null;
    isCvPublic?: boolean;
    availability?: string | null;
    location?: string | null;
  };
  isRequested?: boolean;
  onRequestAdoption?: (studentId: string, message: string) => Promise<void>;
  isRequesting?: boolean;
}

const StudentCard: React.FC<StudentCardProps> = ({
  student,
  isRequested = false,
  onRequestAdoption,
  isRequesting = false,
}) => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [adoptionMessage, setAdoptionMessage] = useState('');
  const { t } = useTranslation();

  const handleRequestAdoption = async () => {
    const trimmedMessage = adoptionMessage.trim();

    if (!trimmedMessage || trimmedMessage.length < 10) {
      return;
    }

    if (onRequestAdoption) {
      try {
        await onRequestAdoption(student.id, trimmedMessage);
        setShowRequestForm(false);
        setAdoptionMessage('');
      } catch (error) {
        // Error handling is done in parent component
      }
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          {getInitials(student.firstName, student.lastName)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900">
            {student.firstName} {student.lastName}
          </h3>
          {/* Show email when provided (companies viewing public list) */}
          {student.email && (
            <div className="mt-0.5 text-sm text-gray-600 truncate" title={student.email}>
              <span className="inline-flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0l-8-6m8 6l-8 6" />
                </svg>
                {student.email}
              </span>
            </div>
          )}
          {student.availability && (
            <div className="flex items-center space-x-1 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-600 text-xs font-medium">{student.availability}</span>
            </div>
          )}
        </div>
      </div>

      {/* Education Info */}
      <div className="space-y-2 mb-4">
        {student.school && (
          <div className="flex items-center space-x-2 text-sm">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            <span className="text-gray-700">{student.school}</span>
          </div>
        )}
        {student.degree && (
          <div className="flex items-center space-x-2 text-sm">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-gray-700">{student.degree}</span>
          </div>
        )}
        {student.location && (
          <div className="flex items-center space-x-2 text-sm">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-700">{student.location}</span>
          </div>
        )}
      </div>

      {/* Skills */}
      {student.skills && student.skills.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">{t('studentDirectory.studentCard.skills')}</h4>
          <div className="flex flex-wrap gap-2">
            {student.skills.slice(0, 6).map((skill, index) => (
              <span
                key={index}
                className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {student.skills.length > 6 && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                {t('studentDirectory.studentCard.moreSkills', { count: student.skills.length - 6 })}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="pt-4 border-t border-gray-100">
        {onRequestAdoption && showRequestForm ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('studentDirectory.studentCard.messageTo')} {student.firstName}
              </label>
              <textarea
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  adoptionMessage.trim().length > 0 && adoptionMessage.trim().length < 10
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                placeholder={t('studentDirectory.studentCard.messagePlaceholder')}
                value={adoptionMessage}
                onChange={(e) => setAdoptionMessage(e.target.value)}
                rows={3}
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-1">
                <div className="text-xs text-gray-500">
                  {adoptionMessage.trim().length < 10 && adoptionMessage.trim().length > 0 && (
                    <span className="text-red-500">
                      {t('studentDirectory.studentCard.minCharactersRequired')}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {t('studentDirectory.studentCard.charactersCount', { current: adoptionMessage.length })}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowRequestForm(false);
                  setAdoptionMessage('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium hover:scale-105 transition-all duration-300 transform active:scale-95"
              >
                {t('studentDirectory.studentCard.cancel')}
              </button>
              <button
                onClick={handleRequestAdoption}
                disabled={isRequesting || adoptionMessage.trim().length < 10}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium hover:scale-105 transition-all duration-300 transform active:scale-95"
              >
                {isRequesting ? t('studentDirectory.studentCard.sending') : t('studentDirectory.studentCard.sendRequest')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {/* CV Link */}
            {student.cvUrl && student.isCvPublic && (
              <a
                href={student.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{t('studentDirectory.studentCard.viewCV')}</span>
              </a>
            )}

            {/* Action Button - only for company users (when onRequestAdoption is provided) */}
            {onRequestAdoption && (
              isRequested ? (
                <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t('studentDirectory.studentCard.requestSent')}</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:scale-105 hover:shadow-lg transition-all duration-300 transform active:scale-95"
                >
                  {t('studentDirectory.studentCard.requestAdoption')}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCard;
