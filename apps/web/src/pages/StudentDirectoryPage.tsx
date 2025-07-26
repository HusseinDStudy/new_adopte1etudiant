import React, { useState } from 'react';
import { useStudents } from '../hooks/useStudents';

const StudentDirectoryPage: React.FC = () => {
  const [requestedStudentIds, setRequestedStudentIds] = useState<Set<string>>(
    new Set()
  );
  const [requestingStudentId, setRequestingStudentId] = useState<string | null>(null);
  const [adoptionMessage, setAdoptionMessage] = useState('');

  const {
    students,
    loading,
    error,
    searchTerm,
    selectedSkills,
    allSkills,
    skillsLoading,
    setSearchTerm,
    handleSkillChange,
    clearFilters,
    sendAdoptionRequest,
    adoptionRequestLoading,
  } = useStudents();

  const handleRequestAdoption = async (studentId: string) => {
    if (!adoptionMessage.trim()) {
      alert('A message is required to send a request.');
      return;
    }

    try {
      setRequestingStudentId(studentId);
      await sendAdoptionRequest(studentId, adoptionMessage);
      setRequestedStudentIds(prev => new Set(prev).add(studentId));
      setRequestingStudentId(null);
      setAdoptionMessage('');
    } catch (err: any) {
      console.error('Failed to send adoption request', err);
      alert(err.response?.data?.message || 'Failed to send adoption request.');
    }
  }

  if (loading) return <div className="text-center p-8">Loading students...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Find Your Next Intern
      </h1>

      {error && (
          <div className="mb-4 text-center bg-red-100 p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-red-800">An Error Occurred</h2>
              <p className="mt-2 text-red-600">{error}</p>
          </div>
      )}

      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
          <input
            type="text"
            placeholder="Search by name, school, degree..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg md:col-span-3"
          />
          <div className="md:col-span-3">
            <h3 className="font-semibold mb-2">Filter by Skills:</h3>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 bg-white border rounded-lg">
              {skillsLoading ? (
                <div>Loading skills...</div>
              ) : (
                allSkills.map((skill) => (
                  <label
                    key={skill.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill.name)}
                      onChange={() => handleSkillChange(skill.name)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{skill.name}</span>
                  </label>
                ))
              )}
            </div>
            <button
              onClick={clearFilters}
              className="mt-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">No students are currently looking for opportunities.</h2>
            <p className="mt-2 text-gray-500">Check back later to find new talent.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div key={student.id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">{student.firstName} {student.lastName}</h2>
              <p className="text-gray-600">{student.email}</p>
              <div className="mt-4">
                <p className="text-sm"><strong>School:</strong> {student.school || 'N/A'}</p>
                <p className="text-sm"><strong>Degree:</strong> {student.degree || 'N/A'}</p>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold">Skills:</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(student.skills || []).map((skill, index) => (
                    <span
                      key={skill.id || `skill-${index}`}
                      className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
              {student.cvUrl && student.isCvPublic && (
                <div className="mt-6 text-right">
                  <a
                    href={student.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View CV
                  </a>
                </div>
              )}
              <div className="mt-6 text-right">
                {requestingStudentId === student.id ? (
                  <div className="mt-4">
                    <textarea
                      className="w-full p-2 border rounded-lg"
                      placeholder="Send a message with your request..."
                      value={adoptionMessage}
                      onChange={(e) => setAdoptionMessage(e.target.value)}
                      rows={3}
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setRequestingStudentId(null)}
                        className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                <button
                  onClick={() => handleRequestAdoption(student.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                        disabled={adoptionRequestLoading}
                      >
                        {adoptionRequestLoading ? 'Sending...' : 'Send Request'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setRequestingStudentId(student.id);
                      setAdoptionMessage('');
                    }}
                  disabled={requestedStudentIds.has(student.id)}
                  className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 disabled:bg-gray-400"
                >
                  {requestedStudentIds.has(student.id) ? 'Request Sent' : 'Request Adoption'}
                </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDirectoryPage; 