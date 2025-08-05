import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOfferApplications, getOfferById } from '../../services/offerService';
import { updateApplicationStatus } from '../../services/applicationService';
import SidebarLayout from '../../components/layout/SidebarLayout';

interface Student {
  userId: string;
  firstName: string;
  lastName: string;
  school?: string;
  degree?: string;
  skills?: string[];
  cvUrl?: string;
  isCvPublic?: boolean;
  isOpenToOpportunities?: boolean;
}

interface Application {
  id: string;
  studentId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  student: Student | null;
  conversation: {
    id: string;
  } | null;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  location?: string;
  duration?: string;
}

const OfferApplicantsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAllData = async () => {
      try {
        const [apps, offerData] = await Promise.all([
          getOfferApplications(id),
          getOfferById(id),
        ]);
        setApplications(Array.isArray(apps) ? apps : []);
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

  // Filter applications based on status
  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === statusFilter));
    }
  }, [applications, statusFilter]);

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    setUpdating(applicationId);
    const originalApplications = [...applications];

    // Optimistic update
    setApplications((prevApps) =>
      prevApps.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    );

    try {
      await updateApplicationStatus(applicationId, newStatus);
      // Refetch to get updated conversation data if needed
      if((newStatus === 'HIRED' || newStatus === 'INTERVIEW') && id) {
        const updatedApps = await getOfferApplications(id);
        setApplications(Array.isArray(updatedApps) ? updatedApps : []);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      setApplications(originalApplications); // Revert on error
      setError('Failed to update application status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const applicationStatuses = ['NEW', 'SEEN', 'INTERVIEW', 'REJECTED', 'HIRED'];
  const statusColors: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-800',
    SEEN: 'bg-yellow-100 text-yellow-800',
    INTERVIEW: 'bg-purple-100 text-purple-800',
    REJECTED: 'bg-red-100 text-red-800',
    HIRED: 'bg-green-100 text-green-800',
  };

  const getStatusCounts = () => {
    const counts: Record<string, number> = { ALL: applications.length };
    applicationStatuses.forEach(status => {
      counts[status] = applications.filter(app => app.status === status).length;
    });
    return counts;
  };

  if (loading) return (
    <SidebarLayout>
      <div className="container mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading applicants...</div>
        </div>
      </div>
    </SidebarLayout>
  );

  if (error) return (
    <SidebarLayout>
      <div className="container mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
          <div className="mt-2">
            <button
              onClick={() => window.location.reload()}
              className="text-red-600 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );

  const statusCounts = getStatusCounts();

  return (
    <SidebarLayout>
      <div className="container mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/company/offers"
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            ← Back to Offers
          </Link>
          <Link
            to={`/company/offers/${id}/invite-students`}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            🎯 Invite Students
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Applicants for {offer?.title}</h1>
        {offer?.description && (
          <p className="text-gray-600 mt-2">{offer.description}</p>
        )}
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
          {offer?.location && <span>📍 {offer.location}</span>}
          {offer?.duration && <span>⏰ {offer.duration}</span>}
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-3">Filter by Status</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({statusCounts.ALL})
          </button>
          {applicationStatuses.map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">
            {statusFilter === 'ALL'
              ? 'No applications yet'
              : `No ${statusFilter.toLowerCase()} applications`
            }
          </h2>
          <p className="mt-2 text-gray-500">
            {statusFilter === 'ALL'
              ? 'When students apply to this offer, they will appear here.'
              : `No applications with ${statusFilter.toLowerCase()} status found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map(app => (
            <div key={app.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Student Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {app.student?.firstName || ''} {app.student?.lastName || ''}
                      </h3>
                      <p className="text-gray-600">Student ID: {app.studentId}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[app.status]}`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        <strong>School:</strong> {app.student?.school || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Degree:</strong> {app.student?.degree || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <strong>Applied:</strong> {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                      {app.updatedAt !== app.createdAt && (
                        <p className="text-sm text-gray-600">
                          <strong>Updated:</strong> {new Date(app.updatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  {app.student?.skills && app.student.skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {app.student.skills.map((skill, index) => (
                          <span
                            key={`skill-${index}`}
                            className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CV Link */}
                  {app.student?.cvUrl && app.student?.isCvPublic && (
                    <div className="mb-4">
                      <a
                        href={app.student.cvUrl}
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
                <div className="flex flex-col gap-3 lg:w-64">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Application Status
                    </label>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      disabled={updating === app.id}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                    >
                      {applicationStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {app.conversation && (
                    <Link
                      to={`/conversations/${app.conversation.id}`}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
                    >
                      View Conversation
                    </Link>
                  )}

                  {app.student?.userId && (
                    <Link
                      to={`/students?highlight=${app.student.userId}`}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
                    >
                      Request Adoption
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </SidebarLayout>
  );
};

export default OfferApplicantsPage; 