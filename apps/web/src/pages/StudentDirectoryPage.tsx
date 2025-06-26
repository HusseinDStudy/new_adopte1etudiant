import React, { useState, useEffect } from 'react';
import { listAvailableStudents } from '../services/studentService';
import { createAdoptionRequest } from '../services/adoptionRequestService';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  school?: string;
  degree?: string;
  skills: string[];
}

const StudentDirectoryPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestedStudentIds, setRequestedStudentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await listAvailableStudents();
        setStudents(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch students.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleRequestAdoption = async (studentId: string) => {
    try {
      await createAdoptionRequest(studentId);
      setRequestedStudentIds(prev => new Set(prev).add(studentId));
      // Ideally, show a toast notification here
    } catch (error) {
      console.error('Failed to send adoption request', error);
      // Ideally, show an error toast here
      alert('Failed to send request. The company may have already sent one.');
    }
  }

  if (loading) return <div className="text-center p-8">Loading students...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Student Directory</h1>
      {students.length === 0 ? (
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
                    {student.skills.map(skill => (
                        <span key={skill} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                            {skill}
                        </span>
                    ))}
                </div>
              </div>
              <div className="mt-6 text-right">
                <button
                  onClick={() => handleRequestAdoption(student.id)}
                  disabled={requestedStudentIds.has(student.id)}
                  className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 disabled:bg-gray-400"
                >
                  {requestedStudentIds.has(student.id) ? 'Request Sent' : 'Request Adoption'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDirectoryPage; 