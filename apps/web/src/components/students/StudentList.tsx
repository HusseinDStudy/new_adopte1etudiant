import React from 'react';
import { useTranslation } from 'react-i18next';
import StudentCard from './StudentCard';
import { Student } from '../../hooks/useStudents';

interface StudentListProps {
  students: Student[];
  loading: boolean;
  error: string | null;
  requestedStudentIds: Set<string>;
  onRequestAdoption?: (studentId: string, message: string) => Promise<void>;
  adoptionRequestLoading: boolean;
  requestingStudentId: string | null;
  totalStudents: number;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({
  students,
  loading,
  error,
  requestedStudentIds,
  onRequestAdoption,
  adoptionRequestLoading,
  requestingStudentId,
  totalStudents,
  sortBy,
  onSortChange,
}) => {
  const { t } = useTranslation();
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">{t('loading.loadingStudents')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <svg className="mx-auto mb-4 h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mb-2 text-lg font-medium text-red-800">{t('errors.loadingError')}</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="py-12 text-center">
        <svg className="mx-auto mb-4 h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
        <h3 className="mb-2 text-lg font-medium text-gray-900">{t('students.noStudentsFound')}</h3>
        <p className="mb-4 text-gray-500">
          {t('noData.noResultsFound')}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {t('students.foundStudents', { count: totalStudents })}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t('students.showingAvailableStudents')}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>{t('common.sortBy')}:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-300 hover:scale-105 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">📅 {t('students.mostRecent')}</option>
            <option value="skills">🎯 {t('students.mostSkills')}</option>
            <option value="school">🏫 {t('students.schoolAZ')}</option>
          </select>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {students.map((student) => (
          <StudentCard
            key={student.id}
            student={student}
            isRequested={requestedStudentIds.has(student.id)}
            onRequestAdoption={onRequestAdoption}
            isRequesting={adoptionRequestLoading && requestingStudentId === student.id}
          />
        ))}
      </div>
    </div>
  );
};

export default StudentList;
