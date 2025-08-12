import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { getOfferById } from '../../services/offerService';
import { listAvailableStudents } from '../../services/studentService';
import { createAdoptionRequest, getRequestedStudentIds } from '../../services/adoptionRequestService';
import SidebarLayout from '../../components/layout/SidebarLayout';
import { Field, Label } from '../../components/form/Field';
import { Input } from '../../components/ui/input';

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
  const { t } = useTranslation();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [invitingStudents, setInvitingStudents] = useState<Set<string>>(new Set());
  const [invitedStudents, setInvitedStudents] = useState<Set<string>>(new Set());
  const [alreadyRequestedStudents, setAlreadyRequestedStudents] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [offerData, studentsData, requestedStudentIds] = await Promise.all([
          getOfferById(id),
          listAvailableStudents({}),
          getRequestedStudentIds(id)
        ]);

        setOffer(offerData);
        setStudents(studentsData);
        setFilteredStudents(studentsData);
        setAlreadyRequestedStudents(new Set(requestedStudentIds));
      } catch (err) {
        setError(t('inviteStudents.failedToLoad'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, t]);

  // Function to refresh requested students state
  const refreshRequestedStudents = async () => {
    try {
      const requestedStudentIds = await getRequestedStudentIds(id);
      setAlreadyRequestedStudents(new Set(requestedStudentIds));
    } catch (err) {
      console.error('Failed to refresh requested students:', err);
    }
  };

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
    setError(''); // Clear any previous errors

    try {
      await createAdoptionRequest(
        studentId,
        `${t('inviteStudents.invitationMessage')} ${offer.title}`,
        offer.id
      );
      // Successfully sent invitation
      setInvitedStudents(prev => new Set(prev).add(studentId));
      setAlreadyRequestedStudents(prev => new Set(prev).add(studentId));
    } catch (err: any) {
      console.error('Failed to invite student:', err);

      // Handle specific error cases
      if (err.message?.includes('already sent') || err.message?.includes('already')) {
        // If already sent, update our state to reflect this
        setAlreadyRequestedStudents(prev => new Set(prev).add(studentId));
        setInvitedStudents(prev => new Set(prev).add(studentId));
        // Don't show error for this case - it's expected behavior
      } else {
        // For other errors, show a user-friendly message
        setError(`${t('inviteStudents.failedToSendInvitation')}: ${err.message || t('common.pleaseTryAgain')}`);
      }
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
    <SidebarLayout>
      <div className="container mx-auto">
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg">{t('inviteStudents.loadingStudents')}</div>
        </div>
      </div>
    </SidebarLayout>
  );

  if (error) return (
    <SidebarLayout>
      <div className="container mx-auto">
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <strong>{t('inviteStudents.error')}:</strong> {error}
        </div>
      </div>
    </SidebarLayout>
  );

  return (
    <SidebarLayout>
      <div className="container mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to={`/company/offers/${id}/applications`}
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            {t('inviteStudents.backToApplicants')}
          </Link>
          <button
            onClick={refreshRequestedStudents}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            title={t('inviteStudents.refreshStatusTitle')}
          >
            {t('inviteStudents.refreshStatus')}
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{t('inviteStudents.title')}</h1>
        {offer && (
          <div className="mt-2">
            <h2 className="text-xl text-gray-700">{t('inviteStudents.for')} {offer.title}</h2>
            {offer.location && <p className="text-gray-600">📍 {offer.location}</p>}
            {offer.skills && offer.skills.length > 0 && (
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-700">{t('inviteStudents.requiredSkills')} </span>
                <div className="mt-1 inline-flex flex-wrap gap-1">
                  {offer.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
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

      {/* Error Display */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="text-lg font-bold text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <Field className="space-y-1">{({ id }) => (
          <>
            <Label>{t('inviteStudents.searchPlaceholder')}</Label>
            <Input
              id={id}
              uiSize="md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('inviteStudents.searchPlaceholder') as string}
            />
          </>
        )}</Field>
      </div>

      {/* Students List */}
      {sortedStudents.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-md">
          <h2 className="text-xl font-semibold">{t('inviteStudents.noStudentsFound')}</h2>
          <p className="mt-2 text-gray-500">
            {searchTerm ? t('inviteStudents.tryAdjustingSearch') : t('inviteStudents.noStudentsDescription')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedStudents.map(student => {
            const matchScore = getMatchScore(student);
            const isInviting = invitingStudents.has(student.id);
            const isNewlyInvited = invitedStudents.has(student.id);
            const wasAlreadyRequested = alreadyRequestedStudents.has(student.id);
            const showAsInvited = isNewlyInvited || wasAlreadyRequested;

            return (
              <div key={student.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="mb-3 flex items-start justify-between">
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
                          <div className="text-xs text-gray-500">{t('inviteStudents.match')}</div>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {student.skills && student.skills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700">{t('inviteStudents.skills')}</h4>
                        <div className="flex flex-wrap gap-2">
                          {student.skills.map((skill, index) => {
                            const isMatching = offer?.skills?.some(offerSkill => 
                              offerSkill.toLowerCase().includes(skill.toLowerCase()) ||
                              skill.toLowerCase().includes(offerSkill.toLowerCase())
                            );
                            
                            return (
                              <span
                                key={index}
                                className={`rounded px-2.5 py-0.5 text-xs font-medium ${
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
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          {t('inviteStudents.viewCv')}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 lg:w-48">
                    {showAsInvited ? (
                      <div className="rounded-lg bg-green-100 px-4 py-2 text-center text-sm font-medium text-green-800">
                        {wasAlreadyRequested && !isNewlyInvited ? (
                          <>{t('inviteStudents.alreadyContacted')}</>
                        ) : (
                          <>{t('inviteStudents.invitationSent')}</>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleInviteStudent(student.id)}
                        disabled={isInviting}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {isInviting ? t('inviteStudents.sending') : t('inviteStudents.sendInvitation')}
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
    </SidebarLayout>
  );
};

export default InviteStudentsPage;
