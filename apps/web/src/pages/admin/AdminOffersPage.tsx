import React, { useState, useEffect } from 'react';
import { Search, Filter, Briefcase, Building2, MapPin, Clock, Eye, Ban, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminOffers, useAdminOfferMutations } from '../../hooks/useAdmin';
import { getMe } from '../../services/authService';

const AdminOffersPage: React.FC = () => {
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
        console.log('🔐 Current user:', user);
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

  const handleToggleStatus = async (offerId: string, currentStatus: boolean) => {
    try {
      await updateStatus(offerId, !currentStatus);
      refetch();
    } catch (error) {
      console.error('Error toggling offer status:', error);
    }
  };

  const handleDeleteOffer = async (offerId: string, offerTitle: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'offre "${offerTitle}" ? Cette action est irréversible.`)) {
      try {
        await deleteOffer(offerId);
        refetch();
      } catch (error) {
        console.error('Error deleting offer:', error);
      }
    }
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
      title="Gestion des offres"
      subtitle="Gérez toutes les offres d'emploi de la plateforme"
    >
      <div className="p-6">
        {/* Header with Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher des offres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter === undefined ? '' : statusFilter.toString()}
              onChange={(e) => {
                const newValue = e.target.value === '' ? undefined : e.target.value === 'true';
                console.log('🔥 Filter changed:', { 
                  rawValue: e.target.value, 
                  newValue, 
                  type: typeof newValue 
                });
                setStatusFilter(newValue);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="true">Actives</option>
              <option value="false">Inactives</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {pagination?.total || 0} offre{(pagination?.total || 0) !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Offers Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des offres...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Erreur lors du chargement des offres</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune offre trouvée</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {truncateText(offer.title, 50)}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Building2 className="w-4 h-4 mr-2" />
                        <span>{offer.company.companyName}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{offer.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{offer.duration}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        offer.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {offer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {truncateText(offer.description, 150)}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{offer._count.applications} candidature{offer._count.applications !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Créée le {formatDate(offer.createdAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/offers/${offer.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir l'offre"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      
                      <button
                        onClick={() => handleToggleStatus(offer.id, offer.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          offer.isActive
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={offer.isActive ? 'Désactiver' : 'Activer'}
                      >
                        <Ban className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteOffer(offer.id, offer.title)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
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
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-700">
                  Affichage de {((currentPage - 1) * 15) + 1} à {Math.min(currentPage * 15, pagination.total)} sur {pagination.total} offres
                </div>
                <div className="flex items-center space-x-2">
                  {/* First Page */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Première page"
                  >
                    «
                  </button>
                  
                  {/* Previous */}
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
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
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === i
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
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
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                  
                  {/* Last Page */}
                  <button
                    onClick={() => setCurrentPage(pagination.totalPages)}
                    disabled={currentPage === pagination.totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Dernière page"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOffersPage; 