import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApplications } from '../hooks/useApplications';
import SidebarLayout from '../components/layout/SidebarLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Button } from '../components/ui/button';

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

  const [confirm, setConfirm] = useState<string | null>(null);
  const handleDeleteApplication = async (applicationId: string) => {
    setConfirm(applicationId);
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
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg">{t('myApplications.loading')}</div>
        </div>
      </div>
    </SidebarLayout>
  );

  if (error) return (
    <SidebarLayout>
      <div className="container mx-auto">
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <strong>{t('myApplications.error')}:</strong> {error}
          <div className="mt-2">
            <button
              onClick={refetch}
              className="text-red-600 underline hover:text-red-800"
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
      <h1 className="mb-6 text-3xl font-bold">{t('myApplications.title')}</h1>
      {!Array.isArray(applications) || applications.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-md">
          <h2 className="text-xl font-semibold">{t('myApplications.noApplications')}</h2>
          <p className="mt-2 text-gray-500">{t('myApplications.noApplicationsDescription')}</p>
          <div className="mt-6">
            <Link
              to="/offers"
              className="inline-block rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors hover:bg-indigo-700"
            >
              {t('myApplications.browseOffers')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.isArray(applications) ? applications.map((app, index) => (
            <div key={app.id || `app-${index}`} className="relative rounded-lg bg-white p-6 shadow-md">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-blue-600 hover:underline">
                    <Link to={`/offers/${app.offer.id}`}>{app.offer.title}</Link>
                  </h2>
                  <p className="mt-1 text-gray-700">{app.offer.company.name}</p>
                  <p className="mt-2 text-sm text-gray-500">{t('myApplications.appliedOn')}: {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col gap-2 md:text-right">
                  <span className={`rounded-full px-3 py-1 text-center text-sm font-semibold ${getStatusClasses(app.status)}`}>
                    {t(`myApplications.status.${app.status.toUpperCase()}`)}
                  </span>
                  <div className="flex flex-col gap-1">
                    {app.conversation && (
                      <Link to={`/conversations/${app.conversation.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                        {t('myApplications.viewConversation')}
                      </Link>
                    )}
                    <Button
                      type="button"
                      onClick={() => setConfirm(app.id)}
                      disabled={deleting}
                      variant="ghost"
                      className="relative z-10 h-auto justify-start p-0 text-sm text-red-600 hover:bg-transparent hover:text-red-800 disabled:opacity-50"
                      aria-label={t('myApplications.deleteApplication')}
                    >
                      {deleting ? t('myApplications.deleting') : t('myApplications.deleteApplication')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )) : null}
        </div>
      )}
      </div>
      {confirm && (
        <Dialog open onOpenChange={(open) => { if (!open) setConfirm(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('common.delete')}</DialogTitle>
              <DialogDescription>{t('myApplications.confirmDelete')}</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <button type="button" className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200" onClick={() => setConfirm(null)}>
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                onClick={async () => {
                  try {
                    await deleteApp(confirm);
                    setConfirm(null);
                    refetch();
                  } catch (err) {
                    alert(t('myApplications.deleteFailed'));
                  }
                }}
              >
                {t('common.confirm')}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </SidebarLayout>
  );
};

export default MyApplicationsPage; 