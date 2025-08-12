import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
        setError(t('offerApplicants.failedToLoad'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id, t]);

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
      setError(t('offerApplicants.failedToUpdateStatus'));
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
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg">{t('offerApplicants.loadingApplicants')}</div>
        </div>
      </div>
    </SidebarLayout>
  );

  if (error) return (
    <SidebarLayout>
      <div className="container mx-auto">
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <strong>{t('offerApplicants.error')}:</strong> {error}
          <div className="mt-2">
            <button
              onClick={() => window.location.reload()}
              className="text-red-600 underline hover:text-red-800"
            >
              {t('offerApplicants.tryAgain')}
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
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/company/offers"
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            {t('offerApplicants.backToOffers')}
          </Link>
          <Link
            to={`/company/offers/${id}/invite-students`}
            className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700"
          >
            {t('offerApplicants.inviteStudents')}
          </Link>
        </div>
        <h1 className="break-words text-3xl font-bold text-gray-900">{t('offerApplicants.title')} {offer?.title}</h1>
        {offer?.description && (
          <p className="mt-2 text-gray-600">{offer.description}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
          {offer?.location && <span>📍 {offer.location}</span>}
          {offer?.duration && <span>⏰ {offer.duration}</span>}
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-medium">{t('offerApplicants.filterByStatus')}</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('offerApplicants.all')} ({statusCounts.ALL})
          </button>
          {applicationStatuses.map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t(`offerApplicants.status.${status.toLowerCase()}`)} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-md">
          <h2 className="text-xl font-semibold">
            {statusFilter === 'ALL'
              ? t('offerApplicants.noApplicationsYet')
              : `${t('offerApplicants.noStatusApplications')} ${t(`offerApplicants.status.${statusFilter.toLowerCase()}`)}`
            }
          </h2>
          <p className="mt-2 text-gray-500">
            {statusFilter === 'ALL'
              ? t('offerApplicants.noApplicationsDescription')
              : `${t('offerApplicants.noStatusApplicationsDescription')} ${t(`offerApplicants.status.${statusFilter.toLowerCase()}`)} ${t('offerApplicants.statusFound')}`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map(app => (
            <div key={app.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                {/* Student Info */}
                <div className="flex-1">
                <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {app.student?.firstName || ''} {app.student?.lastName || ''}
                      </h3>
                      <p className="text-gray-600">{t('offerApplicants.studentId')}: {app.studentId}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[app.status]}`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-600">
                        <strong>{t('offerApplicants.school')}:</strong> {app.student?.school || t('offerApplicants.na')}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>{t('offerApplicants.degree')}:</strong> {app.student?.degree || t('offerApplicants.na')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <strong>{t('offerApplicants.applied')}:</strong> {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                      {app.updatedAt !== app.createdAt && (
                        <p className="text-sm text-gray-600">
                          <strong>{t('offerApplicants.updated')}:</strong> {new Date(app.updatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  {app.student?.skills && app.student.skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="mb-2 text-sm font-medium text-gray-700">{t('offerApplicants.skills')}:</h4>
                      <div className="flex flex-wrap gap-2">
                        {app.student.skills.map((skill, index) => (
                          <span
                            key={`skill-${index}`}
                            className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
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
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        📄 {t('offerApplicants.viewCv')}
                      </a>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 lg:w-64">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('offerApplicants.applicationStatus')}</label>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      disabled={updating === app.id}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
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
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                    >
                      {t('offerApplicants.viewConversation')}
                    </Link>
                  )}

                  {app.student?.userId && (
                    <Link
                      to={`/students?highlight=${app.student.userId}`}
                      className="rounded-lg bg-gray-100 px-4 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      {t('offerApplicants.requestAdoption')}
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