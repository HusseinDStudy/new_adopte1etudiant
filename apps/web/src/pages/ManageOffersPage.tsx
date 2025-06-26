import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listMyOffers, deleteOffer } from '../services/offerService'; // Note: listMyOffers needs to be created

interface Skill {
  id: string;
  name: string;
}

interface Offer {
  id: string;
  title: string;
  location: string | null;
  skills: Skill[];
}

const ManageOffersPage = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOffers = async () => {
    try {
      const data = await listMyOffers(); // This function needs to call a new backend endpoint
      setOffers(data);
    } catch (err) {
      setError('Failed to fetch your offers.');
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
        // Refresh the list after deleting
        setOffers(offers.filter(offer => offer.id !== id));
      } catch (err) {
        alert('Failed to delete offer.');
        console.error(err);
      }
    }
  };

  if (loading) return <div>Loading your offers...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Your Offers</h1>
        <Link to="/offers/new" className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
          Create New Offer
        </Link>
      </div>
      <div className="mt-6 space-y-4">
        {offers.length > 0 ? (
          offers.map(offer => (
            <div key={offer.id} className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm">
              <div>
                <h2 className="text-lg font-semibold">{offer.title}</h2>
                <p className="text-sm text-gray-500">{offer.location}</p>
              </div>
              <div className="space-x-2">
                <Link to={`/offers/edit/${offer.id}`} className="font-medium text-indigo-600 hover:text-indigo-500">
                  Edit
                </Link>
                <button onClick={() => handleDelete(offer.id)} className="font-medium text-red-600 hover:text-red-500">
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>You haven't posted any offers yet.</p>
        )}
      </div>
    </div>
  );
};

export default ManageOffersPage; 