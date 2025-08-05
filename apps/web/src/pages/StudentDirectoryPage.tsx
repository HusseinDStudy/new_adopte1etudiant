import React, { useState, useMemo, useEffect } from 'react';
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
  const navigate = useNavigate();
  const [requestingStudentId, setRequestingStudentId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const itemsPerPage = 9;

  // Restrict access to company profiles only
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'COMPANY') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

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
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      alert('A message is required to send a request.');
      return;
    }

    if (trimmedMessage.length < 10) {
      alert('Message must be at least 10 characters long.');
      return;
    }

    if (trimmedMessage.length > 1000) {
      alert('Message must be no more than 1000 characters long.');
      return;
    }

    try {
      setRequestingStudentId(studentId);
      await sendAdoptionRequest(studentId, trimmedMessage);
      setRequestingStudentId(null);
      alert('Adoption request sent successfully!');
    } catch (err: any) {
      console.error('Failed to send adoption request', err);

      // Handle specific error cases
      if (err.message?.includes('already sent')) {
        alert('You have already sent an adoption request to this student. Check your sent requests to view the conversation.');
      } else {
        alert(err.message || 'Failed to send adoption request.');
      }

      setRequestingStudentId(null);
    }
  }

  // Show access denied for non-company users
  if (!user || user.role !== 'COMPANY') {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès Restreint</h2>
          <p className="text-gray-600 mb-6">
            Cette page est réservée aux profils d'entreprise. Seules les entreprises peuvent consulter le répertoire des étudiants.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:scale-105 transition-all duration-300 transform active:scale-95"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des étudiants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Étudiants à Adopter</h1>
            <p className="text-gray-600 mt-2">Trouvez le talent qui correspond à vos besoins</p>
          </div>
          <button
            onClick={refreshRequestedStudents}
            className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:scale-105 transition-all duration-300 transform active:scale-95"
            title="Actualiser le statut des demandes"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualiser</span>
          </button>
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
          onRequestAdoption={handleRequestAdoption}
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