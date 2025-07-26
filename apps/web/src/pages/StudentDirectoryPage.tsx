import React, { useState } from 'react';
import { useStudents } from '../hooks/useStudents';

const StudentDirectoryPage: React.FC = () => {
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
    requestedStudentIds,
    setRequestedStudentIds,
    refreshRequestedStudents,
  } = useStudents();

  const handleRequestAdoption = async (studentId: string) => {
    const trimmedMessage = adoptionMessage.trim();

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
      setAdoptionMessage('');
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

  if (loading) return <div className="text-center p-8">Loading students...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Find Your Next Intern
        </h1>
        <button
          onClick={refreshRequestedStudents}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          title="Refresh request status"
        >
          🔄 Refresh Status
        </button>
      </div>

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
                      key={`skill-${index}`}
                      className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800"
                    >
                      {skill}
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
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message to {student.firstName}
                      </label>
                      <textarea
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          adoptionMessage.trim().length > 0 && adoptionMessage.trim().length < 10
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                        placeholder="Explain why you'd like to adopt this student and what opportunities you can offer... (minimum 10 characters)"
                        value={adoptionMessage}
                        onChange={(e) => setAdoptionMessage(e.target.value)}
                        rows={4}
                        maxLength={1000}
                      />
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-xs text-gray-500">
                          {adoptionMessage.trim().length < 10 && adoptionMessage.trim().length > 0 && (
                            <span className="text-red-500">
                              Minimum 10 characters required
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {adoptionMessage.length}/1000 characters
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setRequestingStudentId(null);
                          setAdoptionMessage('');
                        }}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRequestAdoption(student.id)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        disabled={adoptionRequestLoading || adoptionMessage.trim().length < 10}
                      >
                        {adoptionRequestLoading ? 'Sending...' : 'Send Request'}
                      </button>
                    </div>
                  </div>
                ) : requestedStudentIds.has(student.id) ? (
                  <div className="text-center">
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium mb-2">
                      ✓ Request Sent
                    </div>
                    <p className="text-xs text-gray-600">
                      Check your sent requests to view the conversation
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setRequestingStudentId(student.id);
                      setAdoptionMessage('');
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Request Adoption
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