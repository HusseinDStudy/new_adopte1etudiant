import React, { useState, useEffect } from 'react';
import { listOffers } from '../services/offerService';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';

// We need to define the shape of an offer on the frontend
interface Company {
  name: string;
}

interface Skill {
  id: string;
  name: string;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  location: string | null;
  company: Company;
  skills: Skill[];
  matchScore: number;
}

const OfferListPage = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const data = await listOffers(debouncedSearchTerm);
        setOffers(data);
      } catch (err) {
        setError('Failed to fetch offers.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [debouncedSearchTerm]);

  const getRingColor = (score: number) => {
    if (score > 75) return 'stroke-green-500';
    if (score > 40) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Explore Opportunities</h1>
        <div className="w-1/3">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
      </div>
      
      {loading ? (
        <div>Loading offers...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {offers.map(offer => (
            <div key={offer.id} className="relative rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
               {user?.role === 'STUDENT' && (
                <div className="absolute top-4 right-4">
                  <svg className="transform -rotate-90 w-20 h-20">
                    <circle cx="40" cy="40" r="30" stroke="currentColor" strokeWidth="8" className="text-gray-200" />
                    <circle
                      cx="40"
                      cy="40"
                      r="30"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 30}
                      strokeDashoffset={(2 * Math.PI * 30) * (1 - offer.matchScore / 100)}
                      className={`transition-all duration-500 ${getRingColor(offer.matchScore)}`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                    {offer.matchScore}%
                  </span>
                </div>
              )}
              <div className="pr-24">
                <h2 className="text-xl font-semibold">{offer.title}</h2>
                <p className="mt-1 text-gray-700">{offer.company.name}</p>
                {offer.location && <p className="mt-1 text-sm text-gray-500">{offer.location}</p>}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {offer.skills.map(skill => (
                  <span key={skill.id} className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-800">
                    {skill.name}
                  </span>
                ))}
              </div>
              <div className="mt-6">
                <Link to={`/offers/${offer.id}`} className="font-medium text-indigo-600 hover:text-indigo-500">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfferListPage; 