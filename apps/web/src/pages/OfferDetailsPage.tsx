import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOfferById } from '../services/offerService';
import { useAuth } from '../context/AuthContext';
import { applyToOffer } from '../services/applicationService';

interface Company {
  name: string;
  logoUrl?: string | null;
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
  duration: string | null;
  company: Company;
  skills: Skill[];
  matchScore?: number;
}

const OfferDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyMessage, setApplyMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!id) return;
    const fetchOffer = async () => {
      try {
        const data = await getOfferById(id);
        setOffer(data);
      } catch (err) {
        setError('Failed to fetch offer details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [id]);

  const handleApply = async () => {
    if (!id) return;
    setIsApplying(true);
    setApplyMessage('');
    try {
      await applyToOffer(id);
      setApplyMessage('Application successful!');
    } catch (err: any) {
      setApplyMessage(err.response?.data?.message || 'Failed to apply. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) return <div>Loading offer details...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!offer) return <div>Offer not found.</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="rounded-lg bg-white p-8 shadow-md">
        {isAuthenticated && user?.role === 'STUDENT' && typeof offer.matchScore === 'number' && (
          <div className="mb-4 text-right">
            <span className="text-2xl font-bold text-indigo-600">
              Your Match Score: {offer.matchScore}%
            </span>
          </div>
        )}
        <h1 className="text-3xl font-bold">{offer.title}</h1>
        <p className="mt-2 text-xl text-gray-700">{offer.company.name}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-gray-600">
          {offer.location && <span>{offer.location}</span>}
          <div className="mt-6 flex items-center justify-between">
            <span className="text-lg font-bold text-indigo-600">
              {offer.duration ? `${offer.duration}` : 'Full-time'}
            </span>
            {isAuthenticated && user?.role === 'STUDENT' && (
              <button
                onClick={handleApply}
                disabled={isApplying || applyMessage === 'Application successful!'}
                className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isApplying ? 'Submitting...' : applyMessage === 'Application successful!' ? 'Applied' : 'Apply Now'}
              </button>
            )}
          </div>
        </div>
        {applyMessage && <p className={`mt-4 text-sm ${applyMessage.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>{applyMessage}</p>}
        <div className="mt-6 flex flex-wrap gap-2">
          {offer.skills.map(skill => (
            <span key={skill.id} className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
              {skill.name}
            </span>
          ))}
        </div>
        <hr className="my-6" />
        <div className="prose max-w-none">
          <p>{offer.description}</p>
        </div>
        <div className="mt-8">
          <h3 className="text-xl font-semibold">About the offer</h3>
        </div>
      </div>
    </div>
  );
};

export default OfferDetailsPage; 