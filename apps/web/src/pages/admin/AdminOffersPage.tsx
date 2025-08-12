import React, { useState, useEffect } from 'react';
import { Search, Filter, Briefcase, Building2, MapPin, Clock, Eye, Ban, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmDialog from '../../components/ui/confirm-dialog';
import { useAdminOffers, useAdminOfferMutations } from '../../hooks/useAdmin';
import { getMe } from '../../services/authService';

const AdminOffersPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getMe();
        // User authenticated
      } catch (error) {
        console.error('❌ Authentication error:', error);
      }
    };
    checkAuth();
  }, []);

  const { offers, pagination, loading, error, refetch } = useAdminOffers({
    search: searchTerm,
    isActive: statusFilter,
    page: currentPage,
    limit: 15,
  });

  const { updateStatus, deleteOffer } = useAdminOfferMutations();
  const [confirm, setConfirm] = useState<{ id: string; title: string } | null>(null);

  const handleToggleStatus = async (offerId: string, currentStatus: boolean) => {
    try {
      await updateStatus(offerId, !currentStatus);
      refetch();
    } catch (error) {
      console.error('Error toggling offer status:', error);
    }
  };

  const handleDeleteOffer = async (offerId: string, offerTitle: string) => {
    setConfirm({ id: offerId, title: offerTitle });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <AdminLayout
      title={t('adminOffers.title')}
      subtitle={t('adminOffers.subtitle')}
    >
      <div className="p-6">
        {/* Header with Filters */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder={t('offers.searchByTitleOrDescription')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter === undefined ? '' : statusFilter.toString()}
              onChange={(e) => {
                const newValue = e.target.value === '' ? undefined : e.target.value === 'true';
                // Filter value updated
                setStatusFilter(newValue);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('adminOffers.allStatuses')}</option>
              <option value="true">{t('adminOffers.active')}</option>
              <option value="false">{t('adminOffers.inactive')}</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {t('adminOffers.count', { count: pagination?.total || 0 })}
          </div>
        </div>

        {/* Offers Grid */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">{t('loading.loadingOffers')}</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-red-600">{t('errors.loadingOffersError')}</p>
            <button
              onClick={refetch}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : offers.length === 0 ? (
          <div className="py-12 text-center">
            <Briefcase className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">{t('offers.noOffersFound')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
                >
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        {truncateText(offer.title, 50)}
                      </h3>
                      <div className="mb-2 flex items-center text-sm text-gray-600">
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>{offer.company.companyName}</span>
                      </div>
                      <div className="mb-2 flex items-center text-sm text-gray-600">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>{offer.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{offer.duration}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        offer.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                      {offer.isActive ? t('adminOffers.active') : t('adminOffers.inactive')}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                    {truncateText(offer.description, 150)}
                  </p>

                  {/* Stats */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="mr-2 h-4 w-4" />
                      <span>{offer._count.applications} {offer._count.applications === 1 ? t('companyOffers.applications') : t('companyOffers.applicationsPlural')}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {t('companyOffers.created')}: {formatDate(offer.createdAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/offers/${offer.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                        title={t('offers.viewDetails')}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      
                      <button
                        onClick={() => handleToggleStatus(offer.id, offer.isActive)}
                        className={`rounded-lg p-2 transition-colors ${
                          offer.isActive
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={offer.isActive ? t('adminOffers.deactivate') : t('adminOffers.activate')}
                      >
                        <Ban className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteOffer(offer.id, offer.title)}
                        className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                        title={t('common.delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="text-xs text-gray-500">
                      {offer.company.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {t('common.showingResults', { start: ((currentPage - 1) * 15) + 1, end: Math.min(currentPage * 15, pagination.total), total: pagination.total })}
                </div>
                <div className="flex items-center space-x-2">
                  {/* First Page */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title={t('common.firstPage')}
                  >
                    «
                  </button>
                  
                  {/* Previous */}
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t('common.previous')}
                  </button>
                  
                  {/* Page Numbers */}
                  {(() => {
                    const pages = [];
                    const maxVisible = 5;
                    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                    let end = Math.min(pagination.totalPages, start + maxVisible - 1);
                    
                    if (end - start + 1 < maxVisible) {
                      start = Math.max(1, end - maxVisible + 1);
                    }
                    
                    for (let i = start; i <= end; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`rounded-md px-3 py-2 text-sm font-medium ${
                            currentPage === i
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    return pages;
                  })()}
                  
                  {/* Next */}
                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t('common.next')}
                  </button>
                  
                  {/* Last Page */}
                  <button
                    onClick={() => setCurrentPage(pagination.totalPages)}
                    disabled={currentPage === pagination.totalPages}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title={t('common.lastPage')}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <ConfirmDialog
        open={!!confirm}
        title={t('common.delete')}
        description={confirm ? (t('adminOffers.confirmDelete', { title: confirm.title }) as string) : ''}
        onConfirm={async () => { if (confirm) { await deleteOffer(confirm.id); refetch(); } }}
        onOpenChange={(open) => { if (!open) setConfirm(null); }}
      />
    </AdminLayout>
  );
};

export default AdminOffersPage; 