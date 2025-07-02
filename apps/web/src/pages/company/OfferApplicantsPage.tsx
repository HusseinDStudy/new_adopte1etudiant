import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOfferApplications, getOfferById } from '../../services/offerService';
import { updateApplicationStatus } from '../../services/applicationService';

interface StudentProfile {
  firstName: string;
  lastName: string;
  school?: string;
  degree?: string;
}

interface Student {
  email: string;
  studentProfile: StudentProfile | null;
}

interface Application {
  id: string;
  student: Student;
  status: string;
  conversation: {
    id: string;
  } | null;
}

interface Offer {
  title: string;
}

const OfferApplicantsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [applications, setApplications] = useState<Application[]>([]);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchAllData = async () => {
      try {
        const [apps, offerData] = await Promise.all([
          getOfferApplications(id),
          getOfferById(id),
        ]);
        setApplications(apps);
        setOffer(offerData);
      } catch (err) {
        setError('Failed to load applicants.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    const originalApplications = [...applications];
    // Optimistic update
    setApplications((prevApps) =>
      prevApps.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    );

    try {
      await updateApplicationStatus(applicationId, newStatus);
      // We might need to refetch to get the conversation ID, or have the update endpoint return the full object
      if((newStatus === 'HIRED' || newStatus === 'INTERVIEW') && id) {
        const updatedApps = await getOfferApplications(id);
        setApplications(updatedApps);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      setApplications(originalApplications); // Revert on error
    }
  };

  const applicationStatuses = ['NEW', 'SEEN', 'INTERVIEW', 'REJECTED', 'HIRED'];

  if (loading) return <div>Loading applicants...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Applicants for {offer?.title}</h1>
      <div className="mt-6">
        {applications.length === 0 ? (
          <p>No one has applied to this offer yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {applications.map(app => (
              <li key={app.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">
                      {app.student.studentProfile?.firstName || ''} {app.student.studentProfile?.lastName || ''}
                    </p>
                    <p className="text-sm text-gray-500">{app.student.email}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {app.student.studentProfile?.degree} at {app.student.studentProfile?.school}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      {applicationStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    {app.conversation && (
                        <Link to={`/conversations/${app.conversation.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 whitespace-nowrap">
                            View Conversation
                        </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OfferApplicantsPage; 