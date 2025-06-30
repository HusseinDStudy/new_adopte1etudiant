import React, { useState, useEffect } from 'react';
import { listAvailableStudents } from '../services/studentService';
import { createAdoptionRequest } from '../services/adoptionRequestService';
import { getAllSkills } from '../services/skillService';
import { useDebounce } from '../hooks/useDebounce';

interface Skill {
  id: string;
  name: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  school?: string;
  degree?: string;
  skills: { name: string }[];
}

const StudentDirectoryPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestedStudentIds, setRequestedStudentIds] = useState<Set<string>>(
    new Set()
  );

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skillsData = await getAllSkills();
        setAllSkills(skillsData);
      } catch (error) {
        console.error('Failed to fetch skills', error);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const filters = {
          search: debouncedSearchTerm,
          skills: selectedSkills,
        };
        const data = await listAvailableStudents(filters);
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
  }, [debouncedSearchTerm, selectedSkills]);

  const handleSkillChange = (skillName: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillName)
        ? prev.filter((s) => s !== skillName)
        : [...prev, skillName]
    );
  };

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
      <h1 className="text-3xl font-bold text-center mb-8">
        Find Your Next Intern
      </h1>
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
              {allSkills.map((skill) => (
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
              ))}
            </div>
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
                  {student.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800"
                    >
                      {skill.name}
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