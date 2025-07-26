import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOfferById } from '../../services/offerService';
import { listAvailableStudents } from '../../services/studentService';
import { createAdoptionRequest } from '../../services/adoptionRequestService';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  school?: string;
  degree?: string;
  skills?: string[];
  matchScore?: number;
  cvUrl?: string;
  isCvPublic?: boolean;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  location?: string;
  duration?: string;
  skills?: string[];
}

const InviteStudentsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [invitingStudents, setInvitingStudents] = useState<Set<string>>(new Set());
  const [invitedStudents, setInvitedStudents] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [offerData, studentsData] = await Promise.all([
          getOfferById(id),
          listAvailableStudents({})
        ]);
        
        setOffer(offerData);
        setStudents(studentsData);
        setFilteredStudents(studentsData);
      } catch (err) {
        setError('Failed to load data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Filter students based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => 
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.school?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.degree?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const handleInviteStudent = async (studentId: string) => {
    if (!offer) return;
    
    setInvitingStudents(prev => new Set(prev).add(studentId));
    
    try {
      await createAdoptionRequest(studentId, `Invitation to apply for: ${offer.title}`);
      setInvitedStudents(prev => new Set(prev).add(studentId));
    } catch (err) {
      console.error('Failed to invite student:', err);
      setError('Failed to send invitation. Please try again.');
    } finally {
      setInvitingStudents(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }
  };

  const getMatchScore = (student: Student) => {
    if (!offer?.skills || !student.skills) return 0;
    
    const offerSkills = offer.skills.map(s => s.toLowerCase());
    const studentSkills = student.skills.map(s => s.toLowerCase());
    const matches = studentSkills.filter(skill => 
      offerSkills.some(offerSkill => offerSkill.includes(skill) || skill.includes(offerSkill))
    );
    
    return Math.round((matches.length / offerSkills.length) * 100);
  };

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const scoreA = getMatchScore(a);
    const scoreB = getMatchScore(b);
    return scoreB - scoreA; // Sort by match score descending
  });

  if (loading) return (
    <div className="container mx-auto p-4">
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading students...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto p-4">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> {error}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Link
            to={`/company/offers/${id}/applications`}
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            ← Back to Applicants
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Invite Students</h1>
        {offer && (
          <div className="mt-2">
            <h2 className="text-xl text-gray-700">For: {offer.title}</h2>
            {offer.location && <p className="text-gray-600">📍 {offer.location}</p>}
            {offer.skills && offer.skills.length > 0 && (
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-700">Required Skills: </span>
                <div className="inline-flex flex-wrap gap-1 mt-1">
                  {offer.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search students by name, school, degree, or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Students List */}
      {sortedStudents.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">No students found</h2>
          <p className="mt-2 text-gray-500">
            {searchTerm ? 'Try adjusting your search criteria.' : 'No students are currently available for invitations.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedStudents.map(student => {
            const matchScore = getMatchScore(student);
            const isInviting = invitingStudents.has(student.id);
            const isInvited = invitedStudents.has(student.id);
            
            return (
              <div key={student.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {student.firstName} {student.lastName}
                        </h3>
                        {student.school && <p className="text-gray-600">{student.school}</p>}
                        {student.degree && <p className="text-gray-600">{student.degree}</p>}
                      </div>
                      {matchScore > 0 && (
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            matchScore > 75 ? 'text-green-600' : 
                            matchScore > 40 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {matchScore}%
                          </div>
                          <div className="text-xs text-gray-500">Match</div>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {student.skills && student.skills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {student.skills.map((skill, index) => {
                            const isMatching = offer?.skills?.some(offerSkill => 
                              offerSkill.toLowerCase().includes(skill.toLowerCase()) ||
                              skill.toLowerCase().includes(offerSkill.toLowerCase())
                            );
                            
                            return (
                              <span
                                key={index}
                                className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                                  isMatching 
                                    ? 'bg-green-100 text-green-800 ring-2 ring-green-300' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {skill}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* CV Link */}
                    {student.cvUrl && student.isCvPublic && (
                      <div className="mb-4">
                        <a
                          href={student.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          📄 View CV
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 lg:w-48">
                    {isInvited ? (
                      <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium text-center">
                        ✓ Invitation Sent
                      </div>
                    ) : (
                      <button
                        onClick={() => handleInviteStudent(student.id)}
                        disabled={isInviting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {isInviting ? 'Sending...' : '🎯 Send Invitation'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InviteStudentsPage;
