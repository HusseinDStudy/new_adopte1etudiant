import React, { useState, useEffect } from 'react';
import { listMyOffers, deleteOffer } from '../../services/offerService';
import { Link } from 'react-router-dom';

interface Offer {
  id: string;
  title: string;
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
    } catch (err) {
      setError('Failed to fetch offers.');
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

  if (loading) return <div>Loading offers...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Your Offers</h1>
        <Link to="/company/offers/new" className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
          Create New Offer
        </Link>
      </div>
      <div className="mt-6">
        <ul className="divide-y divide-gray-200">
          {offers.map(offer => (
            <li key={offer.id} className="flex items-center justify-between py-4">
              <div>
                <h2 className="text-xl font-semibold">{offer.title}</h2>
                <p className="text-sm text-gray-500">{offer._count.applications} antrag(en)</p>
              </div>
              <div className="space-x-4">
                <Link
                  to={`/company/offers/${offer.id}/applications`}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  View Applicants
                </Link>
                <Link to={`/company/offers/edit/${offer.id}`} className="font-medium text-indigo-600 hover:text-indigo-500">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(offer.id)}
                  className="font-medium text-red-600 hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManageOffersPage; 