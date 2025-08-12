import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '../hooks/useStudents';
import { useStudentFilters } from '../hooks/useStudentFilters';
import { useAuth } from '../context/AuthContext';
import StudentFilters from '../components/students/StudentFilters';
import StudentList from '../components/students/StudentList';
import Pagination from '../components/common/Pagination';

type SortOption = 'recent' | 'skills' | 'school';

const StudentDirectoryPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [requestingStudentId, setRequestingStudentId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const itemsPerPage = 9;

  // Page is public now; no redirect based on role

  // Use the new student filters hook
  const {
    searchTerm,
    selectedSkills,
    setSearchTerm,
    handleSkillChange,
    clearAllSkills,
    clearFilters,
  } = useStudentFilters();

  // Use the students hook
  const {
    students,
    loading,
    error,
    allSkills,
    skillsLoading,
    sendAdoptionRequest,
    adoptionRequestLoading,
    requestedStudentIds,
    refreshRequestedStudents,
  } = useStudents();

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    if (!students || !Array.isArray(students)) return [];

    // Apply filters
    let filtered = students.filter(student => {
      // Search filter
      const searchMatch = !searchTerm ||
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // email is no longer part of public payload
        (student.school && student.school.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.degree && student.degree.toLowerCase().includes(searchTerm.toLowerCase()));

      // Skills filter
      const skillsMatch = selectedSkills.length === 0 ||
        selectedSkills.some(skill => student.skills?.includes(skill));

      return searchMatch && skillsMatch;
    });

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        return filtered.sort((a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      case 'skills':
        return filtered.sort((a, b) =>
          (b.skills?.length || 0) - (a.skills?.length || 0)
        );
      case 'school':
        return filtered.sort((a, b) =>
          (a.school || '').localeCompare(b.school || '')
        );
      default:
        return filtered;
    }
  }, [students, searchTerm, selectedSkills, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = filteredAndSortedStudents.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when filters change
  const prevFiltersRef = React.useRef<string>('');
  React.useEffect(() => {
    const filtersString = JSON.stringify({
      search: searchTerm,
      skills: selectedSkills,
      sortBy
    });

    if (prevFiltersRef.current !== '' && prevFiltersRef.current !== filtersString) {
      setCurrentPage(1);
    }

    prevFiltersRef.current = filtersString;
  }, [searchTerm, selectedSkills, sortBy]);

  // Remove mock metrics - we don't need them on this page

  const handleRequestAdoption = async (studentId: string, message: string) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      alert(t('studentDirectory.messageRequired'));
      return;
    }

    if (trimmedMessage.length < 10) {
      alert(t('studentDirectory.messageTooShort'));
      return;
    }

    if (trimmedMessage.length > 1000) {
      alert(t('studentDirectory.messageTooLong'));
      return;
    }

    try {
      setRequestingStudentId(studentId);
      await sendAdoptionRequest(studentId, trimmedMessage);
      setRequestingStudentId(null);
      alert(t('studentDirectory.requestSentSuccess'));
    } catch (err: any) {
      console.error('Failed to send adoption request', err);

      // Handle specific error cases
      if (err.message?.includes('already sent')) {
        alert(t('studentDirectory.alreadySentRequest'));
      } else {
        alert(err.message || t('studentDirectory.requestFailed'));
      }

      setRequestingStudentId(null);
    }
  }

  // Public access: we do not block the page for non-company users

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">{t('studentDirectory.loadingStudents')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('studentDirectory.title')}</h1>
            <p className="mt-2 text-gray-600">{t('studentDirectory.subtitle')}</p>
          </div>
          {user?.role === 'COMPANY' && (
            <button
              onClick={refreshRequestedStudents}
              className="flex transform items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:scale-105 hover:bg-gray-50 active:scale-95"
              title={t('studentDirectory.refreshTooltip')}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{t('studentDirectory.refresh')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-8">
        <StudentFilters
          searchTerm={searchTerm}
          selectedSkills={selectedSkills}
          allSkills={allSkills}
          skillsLoading={skillsLoading}
          onSearchChange={setSearchTerm}
          onSkillChange={handleSkillChange}
          onClearAllSkills={clearAllSkills}
          onClearFilters={clearFilters}
        />
      </div>



      {/* Students List */}
      <div className="mb-8">
        <StudentList
          students={paginatedStudents}
          loading={loading}
          error={error}
          requestedStudentIds={requestedStudentIds}
          onRequestAdoption={user?.role === 'COMPANY' ? handleRequestAdoption : undefined}
          adoptionRequestLoading={adoptionRequestLoading}
          requestingStudentId={requestingStudentId}
          totalStudents={filteredAndSortedStudents.length}
          sortBy={sortBy}
          onSortChange={(newSortBy) => setSortBy(newSortBy as SortOption)}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={filteredAndSortedStudents.length}
        />
      )}
    </div>
  );
};

export default StudentDirectoryPage; 