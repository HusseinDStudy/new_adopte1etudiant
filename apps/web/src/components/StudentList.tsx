import React from 'react';
import StudentCard from './StudentCard';
import { Student } from '../hooks/useStudents';

interface StudentListProps {
  students: Student[];
  loading: boolean;
  error: string | null;
  requestedStudentIds: Set<string>;
  onRequestAdoption: (studentId: string, message: string) => Promise<void>;
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

  if (error) {
    return (
      <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-red-800 mb-2">Erreur de chargement</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun étudiant trouvé</h3>
        <p className="text-gray-500 mb-4">
          Aucun étudiant ne correspond à vos critères de recherche
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {totalStudents} étudiant(s) trouvé(s)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Affichage des étudiants disponibles
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Trier par:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:scale-105 transition-all duration-300"
          >
            <option value="recent">📅 Plus récents</option>
            <option value="skills">🎯 Plus de compétences</option>
            <option value="school">🏫 École (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
