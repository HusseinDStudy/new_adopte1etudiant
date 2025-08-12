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
    <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:transform hover:shadow-xl">
      {/* Header */}
      <div className="mb-4 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 font-semibold text-white transition-all duration-300 group-hover:rotate-3 group-hover:scale-110">
          {getInitials(student.firstName, student.lastName)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {student.firstName} {student.lastName}
          </h3>
          {/* Show email when provided (companies viewing public list) */}
          {student.email && (
            <div className="mt-0.5 truncate text-sm text-gray-600" title={student.email}>
              <span className="inline-flex items-center">
                <svg className="mr-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0l-8-6m8 6l-8 6" />
                </svg>
                {student.email}
              </span>
            </div>
          )}
          {student.availability && (
            <div className="mt-1 flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span className="text-xs font-medium text-green-600">{student.availability}</span>
            </div>
          )}
        </div>
      </div>

      {/* Education Info */}
      <div className="mb-4 space-y-2">
        {student.school && (
          <div className="flex items-center space-x-2 text-sm">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            <span className="text-gray-700">{student.school}</span>
          </div>
        )}
        {student.degree && (
          <div className="flex items-center space-x-2 text-sm">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-gray-700">{student.degree}</span>
          </div>
        )}
        {student.location && (
          <div className="flex items-center space-x-2 text-sm">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <h4 className="mb-2 text-sm font-medium text-gray-900">{t('studentDirectory.studentCard.skills')}</h4>
          <div className="flex flex-wrap gap-2">
            {student.skills.slice(0, 6).map((skill, index) => (
              <span
                key={index}
                className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
              >
                {skill}
              </span>
            ))}
            {student.skills.length > 6 && (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
                {t('studentDirectory.studentCard.moreSkills', { count: student.skills.length - 6 })}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-gray-100 pt-4">
        {onRequestAdoption && showRequestForm ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('studentDirectory.studentCard.messageTo')} {student.firstName}
              </label>
              <textarea
                className={`w-full rounded-lg border p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
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
              <div className="mt-1 flex items-center justify-between">
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
                className="transform rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:scale-105 hover:bg-gray-200 active:scale-95"
              >
                {t('studentDirectory.studentCard.cancel')}
              </button>
              <button
                onClick={handleRequestAdoption}
                disabled={isRequesting || adoptionMessage.trim().length < 10}
                className="transform rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-blue-700 active:scale-95 disabled:opacity-50"
              >
                {isRequesting ? t('studentDirectory.studentCard.sending') : t('studentDirectory.studentCard.sendRequest')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* CV Link */}
            {student.cvUrl && student.isCvPublic && (
              <a
                href={student.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{t('studentDirectory.studentCard.viewCV')}</span>
              </a>
            )}

            {/* Action Button - only for company users (when onRequestAdoption is provided) */}
            {onRequestAdoption && (
              isRequested ? (
                <div className="flex items-center space-x-1 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t('studentDirectory.studentCard.requestSent')}</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="transform rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-blue-700 hover:shadow-lg active:scale-95"
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
