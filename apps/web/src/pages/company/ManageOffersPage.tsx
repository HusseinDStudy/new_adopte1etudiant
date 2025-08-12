import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { listMyOffers, deleteOffer } from '../../services/offerService';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/layout/SidebarLayout';
import ConfirmDialog from '../../components/ui/confirm-dialog';

interface Offer {
  id: string;
  title: string;
  description: string;
  location: string | null;
  duration: string | null;
  skills: string[];
  createdAt: string;
  updatedAt: string;
  _count: {
    applications: number;
  };
}

const ManageOffersPage = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const fetchOffers = async () => {
    try {
      const data = await listMyOffers();
      setOffers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || t('companyOffers.failedToFetch'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [t]);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const handleDelete = (id: string) => setConfirmDeleteId(id);

  if (loading) return (
    <SidebarLayout>
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg">{t('companyOffers.loadingOffers')}</div>
      </div>
    </SidebarLayout>
  );

  return (
    <SidebarLayout>
      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <strong>{t('companyOffers.error')}:</strong> {error}
          <div className="mt-2">
            <button
              onClick={fetchOffers}
              className="text-red-600 underline hover:text-red-800"
            >
              {t('companyOffers.tryAgain')}
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-3xl font-bold">{t('companyOffers.title')}</h1>
          <p className="mt-1 text-gray-600">
            {offers.length} {offers.length !== 1 ? t('companyOffers.subtitle') : t('companyOffers.subtitle').replace('offres', 'offre').replace('offers', 'offer')}
          </p>
        </div>
        <Link
          to="/company/offers/new"
          className="transform rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-indigo-700 hover:shadow-lg active:scale-95"
        >
          {t('companyOffers.createNewOffer')}
        </Link>
      </div>

      {offers.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-md">
          <h2 className="text-xl font-semibold">{t('companyOffers.noOffersYet')}</h2>
          <p className="mt-2 text-gray-500">{t('companyOffers.noOffersDescription')}</p>
          <div className="mt-6">
            <Link
              to="/company/offers/new"
              className="inline-block rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors hover:bg-indigo-700"
            >
              {t('companyOffers.createFirstOffer')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {offers.map(offer => (
            <div key={offer.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
              <div className="p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <h2 className="mb-2 break-words text-xl font-semibold text-gray-900">{offer.title}</h2>
                    <div className="mb-3 flex flex-wrap gap-4 text-sm text-gray-600">
                      {offer.location && (
                        <span className="flex items-center">
                          📍 {offer.location}
                        </span>
                      )}
                      {offer.duration && (
                        <span className="flex items-center">
                          ⏰ {offer.duration}
                        </span>
                      )}
                      <span className="flex items-center">
                        📅 {t('companyOffers.created')} {new Date(offer.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="mb-4 line-clamp-2 text-gray-700">
                      {offer.description.length > 150
                        ? `${offer.description.substring(0, 150)}...`
                        : offer.description
                      }
                    </p>

                    {offer.skills && offer.skills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700">{t('companyOffers.requiredSkills')}</h4>
                        <div className="flex flex-wrap gap-2">
                          {offer.skills.map((skill, index) => (
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

                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-gray-50 px-3 py-2">
                        <span className="text-sm font-medium text-gray-700">
                          {offer._count.applications} {offer._count.applications !== 1 ? t('companyOffers.applicationsPlural') : t('companyOffers.applications')}
                        </span>
                      </div>
                      {offer.updatedAt !== offer.createdAt && (
                        <span className="text-xs text-gray-500">
                          {t('companyOffers.updated')} {new Date(offer.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-4">
                  <Link
                    to={`/company/offers/${offer.id}/applications`}
                    className="transform rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-blue-700 hover:shadow-md active:scale-95"
                  >
                    {t('companyOffers.viewApplicants')} ({offer._count.applications})
                  </Link>
                  <Link
                    to={`/company/offers/edit/${offer.id}`}
                    className="transform rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:scale-105 hover:bg-gray-200 hover:shadow-md active:scale-95"
                  >
                    {t('companyOffers.edit')}
                  </Link>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="transform rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-all duration-300 hover:scale-105 hover:bg-red-200 hover:shadow-md active:scale-95"
                  >
                    {t('companyOffers.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Confirm delete offer */}
      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title={t('companyOffers.confirmDelete')}
        description={t('companyOffers.confirmDeleteDescription') as string}
        confirmText={t('common.delete') as string}
        cancelText={t('common.cancel') as string}
        onConfirm={async () => {
          if (!confirmDeleteId) return;
          try {
            setDeleteError('');
            await deleteOffer(confirmDeleteId);
            setConfirmDeleteId(null);
            fetchOffers();
          } catch (err) {
            setDeleteError(t('companyOffers.failedToDelete'));
          }
        }}
      />

      {deleteError && (
        <div className="mt-4 text-red-600">{deleteError}</div>
      )}
    </SidebarLayout>
  );
};

export default ManageOffersPage; 