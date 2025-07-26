import React, { useState, useEffect } from 'react';
import { listMyOffers, deleteOffer } from '../../services/offerService';
import { Link } from 'react-router-dom';

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

  const fetchOffers = async () => {
    try {
      const data = await listMyOffers();
      setOffers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch offers.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await deleteOffer(id);
        fetchOffers(); // Refresh the list after deletion
      } catch (err) {
        alert('Failed to delete offer.');
        console.error(err);
      }
    }
  };

  if (loading) return (
    <div className="container mx-auto p-4">
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading your offers...</div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
          <div className="mt-2">
            <button
              onClick={fetchOffers}
              className="text-red-600 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Your Offers</h1>
          <p className="text-gray-600 mt-1">
            {offers.length} offer{offers.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          to="/company/offers/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Create New Offer
        </Link>
      </div>

      {offers.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">No offers created yet</h2>
          <p className="mt-2 text-gray-500">Create your first job offer to start attracting talent.</p>
          <div className="mt-6">
            <Link
              to="/company/offers/new"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Your First Offer
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {offers.map(offer => (
            <div key={offer.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{offer.title}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
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
                        📅 Created {new Date(offer.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {offer.description.length > 150
                        ? `${offer.description.substring(0, 150)}...`
                        : offer.description
                      }
                    </p>

                    {offer.skills && offer.skills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Required Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {offer.skills.map((skill, index) => (
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

                    <div className="flex items-center gap-4">
                      <div className="bg-gray-50 px-3 py-2 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">
                          {offer._count.applications} Application{offer._count.applications !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {offer.updatedAt !== offer.createdAt && (
                        <span className="text-xs text-gray-500">
                          Updated {new Date(offer.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  <Link
                    to={`/company/offers/${offer.id}/applications`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Applicants ({offer._count.applications})
                  </Link>
                  <Link
                    to={`/company/offers/edit/${offer.id}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageOffersPage; 