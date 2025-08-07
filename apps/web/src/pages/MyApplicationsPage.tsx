import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApplications } from '../hooks/useApplications';
import SidebarLayout from '../components/layout/SidebarLayout';

const MyApplicationsPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    applications,
    loading,
    error,
    refetch,
    deleteApp,
    deleting,
  } = useApplications();

  const handleDeleteApplication = async (applicationId: string) => {
    if (window.confirm(t('myApplications.confirmDelete'))) {
      try {
        await deleteApp(applicationId);
      } catch (err) {
        alert(t('myApplications.deleteFailed'));
      }
    }
  };

  const getStatusClasses = (status: string) => {
    switch (status.toUpperCase()) {
      case 'HIRED':
        return 'bg-green-200 text-green-800';
      case 'REJECTED':
        return 'bg-red-200 text-red-800';
      case 'INTERVIEW':
        return 'bg-purple-200 text-purple-800';
      case 'SEEN':
        return 'bg-blue-200 text-blue-800';
      case 'NEW':
      default:
        return 'bg-yellow-200 text-yellow-800';
    }
  };

  if (loading) return (
    <SidebarLayout>
      <div className="container mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">{t('myApplications.loading')}</div>
        </div>
      </div>
    </SidebarLayout>
  );

  if (error) return (
    <SidebarLayout>
      <div className="container mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>{t('myApplications.error')}:</strong> {error}
          <div className="mt-2">
            <button
              onClick={refetch}
              className="text-red-600 hover:text-red-800 underline"
            >
              {t('myApplications.tryAgain')}
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );

  return (
    <SidebarLayout>
      <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t('myApplications.title')}</h1>
      {!Array.isArray(applications) || applications.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">{t('myApplications.noApplications')}</h2>
          <p className="mt-2 text-gray-500">{t('myApplications.noApplicationsDescription')}</p>
          <div className="mt-6">
            <Link
              to="/offers"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {t('myApplications.browseOffers')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.isArray(applications) ? applications.map((app, index) => (
            <div key={app.id || `app-${index}`} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-blue-600 hover:underline">
                    <Link to={`/offers/${app.offer.id}`}>{app.offer.title}</Link>
                  </h2>
                  <p className="text-gray-700 mt-1">{app.offer.company.name}</p>
                  <p className="text-gray-500 text-sm mt-2">{t('myApplications.appliedOn')}: {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col md:text-right gap-2">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full text-center ${getStatusClasses(app.status)}`}>
                    {t(`myApplications.status.${app.status.toUpperCase()}`)}
                  </span>
                  <div className="flex flex-col gap-1">
                    {app.conversation && (
                      <Link to={`/conversations/${app.conversation.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                        {t('myApplications.viewConversation')}
                      </Link>
                    )}
                    <button
                      onClick={() => handleDeleteApplication(app.id)}
                      disabled={deleting}
                      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      {deleting ? t('myApplications.deleting') : t('myApplications.deleteApplication')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )) : null}
        </div>
      )}
      </div>
    </SidebarLayout>
  );
};

export default MyApplicationsPage; 